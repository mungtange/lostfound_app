// 캐시 이름 (버전 관리용)
const CACHE_NAME = 'lostfound-v1';

// 캐시할 파일 목록
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json'
];

// 설치 단계: 파일들을 캐시에 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 저장 완료');
        return cache.addAll(urlsToCache);
      })
  );
});

// 네트워크 요청을 캐시에서 응답
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시에서 응답
        if (response) {
          return response;
        }
        // 없으면 네트워크에서 요청
        return fetch(event.request);
      })
  );
});

// 새로운 버전이 있으면 이전 캐시 삭제
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});