self.addEventListener('push', event => {
    try {
        if (!event.data) return;

        const data = event.data.json();

        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/canvasIcon.png',
            badge: '/canvasIcon.png',
            data: data, // Store the data for use in notificationclick
        });
    } catch (error) {
        console.error('Push event error:', error);
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        (async () => {
            const data = event.notification.data;
            if (data && data.designId) {
                clients.openWindow(`/?designId=${data.designId}`);
            } else {
                clients.openWindow('/');
            }
        })()
    );
});
