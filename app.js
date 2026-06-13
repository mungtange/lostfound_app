// 데이터 저장
let items = JSON.parse(localStorage.getItem('lostfound')) || [];
let currentPhotoData = null;  // 현재 등록할 사진 데이터

// 전화번호 자동 포맷팅
function formatPhoneNumber(value) {
    let numbers = value.replace(/[^\d]/g, '');
    
    if (numbers.length > 11) {
        numbers = numbers.slice(0, 11);
    }
    
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
}

// 전화번호 입력 설정
function setupPhoneInput() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
        const cursorPos = e.target.selectionStart;
        const formatted = formatPhoneNumber(e.target.value);
        
        if (formatted !== e.target.value) {
            const diff = formatted.length - e.target.value.length;
            e.target.value = formatted;
            e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
        }
    });
    
    phoneInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        const numbers = pasted.replace(/[^\d]/g, '').slice(0, 11);
        const formatted = formatPhoneNumber(numbers);
        phoneInput.value = formatted;
    });
}

// 사진 미리보기
function previewPhoto(input) {
    const preview = document.getElementById('photoPreview');
    const removeBtn = document.getElementById('removePhotoBtn');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            currentPhotoData = e.target.result;
            preview.innerHTML = `<img src="${currentPhotoData}" alt="미리보기">`;
            removeBtn.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// 사진 제거
function removePhoto() {
    const preview = document.getElementById('photoPreview');
    const photoInput = document.getElementById('photoInput');
    const removeBtn = document.getElementById('removePhotoBtn');
    
    preview.innerHTML = `
        <div class="photo-placeholder">
            📸
            <span>사진 추가하기</span>
        </div>
    `;
    photoInput.value = '';
    currentPhotoData = null;
    removeBtn.style.display = 'none';
}

// HTML 이스케이프
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 사진 확대 모달
function showImageModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = imageUrl;
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}

// 화면 표시 (사진 포함)
function showLists() {
    const lostItems = items.filter(i => i.type === 'lost');
    const foundItems = items.filter(i => i.type === 'found');
    
    const lostList = document.getElementById('lostList');
    if (lostItems.length === 0) {
        lostList.innerHTML = '<div class="empty-message">📭 등록된 분실물이 없습니다</div>';
    } else {
        lostList.innerHTML = lostItems.map(item => `
            <div class="item-card">
                ${item.photo ? `
                    <div class="item-photo" onclick="showImageModal('${item.photo}')">
                        <img src="${item.photo}" alt="물건 사진">
                    </div>
                ` : `
                    <div class="item-photo" onclick="showImageModal('')">
                        <div class="no-photo">📷</div>
                    </div>
                `}
                <h3>❌ ${escapeHtml(item.title)}</h3>
                <p>📝 ${escapeHtml(item.desc)}</p>
                <p>📍 ${escapeHtml(item.location)}</p>
                <p class="contact">📞 ${escapeHtml(item.phone)}</p>
                <button class="delete-btn" onclick="deleteItem('${item.id}')">🗑️ 삭제</button>
            </div>
        `).join('');
    }
    
    const foundList = document.getElementById('foundList');
    if (foundItems.length === 0) {
        foundList.innerHTML = '<div class="empty-message">📭 등록된 습득물이 없습니다</div>';
    } else {
        foundList.innerHTML = foundItems.map(item => `
            <div class="item-card">
                ${item.photo ? `
                    <div class="item-photo" onclick="showImageModal('${item.photo}')">
                        <img src="${item.photo}" alt="물건 사진">
                    </div>
                ` : `
                    <div class="item-photo" onclick="showImageModal('')">
                        <div class="no-photo">📷</div>
                    </div>
                `}
                <h3>✅ ${escapeHtml(item.title)}</h3>
                <p>📝 ${escapeHtml(item.desc)}</p>
                <p>📍 ${escapeHtml(item.location)}</p>
                <p class="contact">📞 ${escapeHtml(item.phone)}</p>
                <button class="delete-btn" onclick="deleteItem('${item.id}')">🗑️ 삭제</button>
            </div>
        `).join('');
    }
}

// 저장 함수
function saveItems() {
    try {
        localStorage.setItem('lostfound', JSON.stringify(items));
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('⚠️ 저장 공간이 부족합니다. 오래된 게시물을 삭제해주세요.\n(사진은 용량을 많이 차지합니다)');
        } else {
            alert('⚠️ 저장 중 오류가 발생했습니다.');
        }
        return false;
    }
}

// 새 물건 등록 (사진 포함)
function addItem() {
    const type = document.getElementById('itemType').value;
    let title = document.getElementById('title').value;
    let desc = document.getElementById('desc').value;
    let location = document.getElementById('location').value;
    let phone = document.getElementById('phone').value;
    
    let phoneNumbersOnly = phone.replace(/[^\d]/g, '');
    
    if (!title || !title.trim()) {
        alert('물건 이름을 입력해주세요!');
        return;
    }
    if (!desc || !desc.trim()) {
        alert('설명을 입력해주세요!');
        return;
    }
    if (!location || !location.trim()) {
        alert('위치를 입력해주세요!');
        return;
    }
    if (!phoneNumbersOnly) {
        alert('전화번호를 입력해주세요!');
        return;
    }
    
    if (phoneNumbersOnly.length < 10 || phoneNumbersOnly.length > 11) {
        alert('전화번호는 10~11자리 숫자여야 합니다.\n예: 01012345678');
        return;
    }
    
    if (title.length > 50) {
        alert('제목은 50자 이내로 입력해주세요.');
        return;
    }
    if (desc.length > 500) {
        alert('설명은 500자 이내로 입력해주세요.');
        return;
    }
    
    const newItem = {
        id: Date.now().toString(),
        type: type,
        title: title.trim(),
        desc: desc.trim(),
        location: location.trim(),
        phone: phone,
        photo: currentPhotoData || null,  // 사진 데이터 저장
        date: new Date().toLocaleString(),
        timestamp: Date.now()
    };
    
    items.unshift(newItem);
    
    if (saveItems()) {
        // 폼 초기화
        document.getElementById('title').value = '';
        document.getElementById('desc').value = '';
        document.getElementById('location').value = '';
        document.getElementById('phone').value = '';
        removePhoto();  // 사진도 초기화
        
        showLists();
        showTab(type === 'lost' ? 'lost' : 'found', null);
        alert('✅ 등록되었습니다!');
    }
}

// 삭제
function deleteItem(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        items = items.filter(i => i.id !== id);
        if (saveItems()) {
            showLists();
        }
    }
}

// 탭 전환
function showTab(tab, clickEvent) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${tab}Tab`).classList.add('active');
    
    if (clickEvent && clickEvent.target) {
        clickEvent.target.classList.add('active');
    } else {
        const btns = document.querySelectorAll('.tab-btn');
        if (tab === 'lost') btns[0].classList.add('active');
        else if (tab === 'found') btns[1].classList.add('active');
        else if (tab === 'add') btns[2].classList.add('active');
    }
    
    showLists();
}

// 오래된 데이터 정리
function autoCleanup() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const oldItems = items.filter(item => item.timestamp < oneWeekAgo);
    if (oldItems.length > 30) {
        if (confirm('오래된 게시물이 많습니다. 7일 이상 지난 글을 정리할까요?')) {
            items = items.filter(item => item.timestamp >= oneWeekAgo);
            saveItems();
            showLists();
        }
    }
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// 실행
document.addEventListener('DOMContentLoaded', function() {
    setupPhoneInput();
    showLists();
    autoCleanup();
});