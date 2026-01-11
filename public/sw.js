// public/sw.js
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            await self.clients.claim();
        })()
    );
});

self.addEventListener('push', (event) => {
    try {
        if (!event.data) return;

        const data = event.data.json();

        const options = {
            body: data.body,
            icon: '/canvasIcon.png',
            badge: '/canvasIcon.png',
            data: {
                designId: data.designId || null,
                url: data.designId ? `/?designId=${data.designId}` : '/',
            },
        };

        event.waitUntil(
            self.registration.showNotification(
                data.title || 'Notification',
                options
            )
        );
    } catch (error) {
        console.error('Push event error:', error);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        (async () => {
            const targetUrl =
                event.notification.data?.url || '/';

            const allClients = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });

            for (const client of allClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }

            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })()
    );
});
