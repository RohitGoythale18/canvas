// src/lib/push.ts

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray.buffer;
}

export async function subscribeToPush(token: string) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push not supported');
        return;
    }

    // Ask permission (NOW this will appear)
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
        console.error('Missing VAPID public key');
        return;
    }

    // Register SW
    const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
    });

    // Wait until active & controlling
    await navigator.serviceWorker.ready;

    if (!navigator.serviceWorker.controller) {
        console.warn('Service Worker not controlling page');
        return;
    }

    // Avoid duplicate subscription
    const existing = await registration.pushManager.getSubscription();
    if (existing) return;

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    // Save subscription on backend
    await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
    });

    console.log('Push subscription successful');
}
