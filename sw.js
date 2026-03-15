const CACHE_NAME = 'quoc-ky-cache-v1';

// Lần đầu chạy, nó cài đặt bộ nhớ đệm
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Bắt mọi yêu cầu mạng (nhất là ảnh từ flagcdn)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Nếu có trong máy rồi thì lấy ra xài luôn (đéo cần mạng)
            if (cachedResponse) {
                return cachedResponse;
            }
            // Nếu chưa có thì phải tải từ mạng về, xong lén cất vào kho
            return fetch(event.request).then((networkResponse) => {
                // Kiểm tra xem tải có thành công không
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // Đéo có mạng mà cũng đéo có trong cache thì chịu
                console.log("Mất mạng và chưa lưu ảnh này: ", event.request.url);
            });
        })
    );
});