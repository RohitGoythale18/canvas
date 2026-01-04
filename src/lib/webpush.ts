import { PushPayload } from '@/types';
import webpush from 'web-push';

let vapidInitialized = false;

function initVapid() {
    if (vapidInitialized) return;

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const mailto = process.env.VAPID_MAILTO;

    if (!publicKey || !privateKey || !mailto) {
        throw new Error('Missing VAPID configuration');
    }

    webpush.setVapidDetails(mailto, publicKey, privateKey);
    vapidInitialized = true;
}

export async function sendPushNotification(
    subscription: webpush.PushSubscription,
    payload: PushPayload
) {
    initVapid();

    await webpush.sendNotification(
        subscription,
        JSON.stringify(payload)
    );
}
