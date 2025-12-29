import webpush from 'web-push';

webpush.setVapidDetails(
    process.env.VAPID_MAILTO || 'mailto:rohitgoythale23@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
    title: string;
    body: string;
    designId?: string;
}

export async function sendPushNotification(
    subscription: webpush.PushSubscription,
    payload: PushPayload
) {
    try {
        if (!subscription || !subscription.endpoint) {
            throw new Error('Invalid subscription');
        }

        await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
        );
        console.log('Push notification sent successfully');
    } catch (error) {
        console.error('Failed to send push notification:', error);
        throw error; // Re-throw to allow caller to handle
    }
}
