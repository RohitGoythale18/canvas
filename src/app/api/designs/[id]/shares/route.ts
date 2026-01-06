import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { sendPushNotification } from '@/lib/webpush';
import webpush from 'web-push';

interface WebPushError extends Error {
    statusCode?: number;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authRequest = authenticateRequest(request);
        const ownerId = authRequest.user!.userId;

        const { id: designId } = await params;
        const { email, permission } = await request.json();

        if (!designId || !email) {
            return NextResponse.json(
                { error: 'Design ID and email are required' },
                { status: 400 }
            );
        }

        const design = await prisma.design.findUnique({
            where: { id: designId },
            select: { id: true, ownerId: true, title: true },
        });

        if (!design || design.ownerId !== ownerId) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        const receiver = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true },
        });

        if (!receiver || receiver.id === ownerId) {
            return NextResponse.json(
                { error: 'Invalid receiver' },
                { status: 400 }
            );
        }

        const alreadyShared = await prisma.sharedDesign.findFirst({
            where: { designId, sharedWithId: receiver.id },
        });

        if (alreadyShared) {
            return NextResponse.json(
                { error: 'Design already shared' },
                { status: 409 }
            );
        }

        // ✅ SHARE (CRITICAL PATH)
        await prisma.sharedDesign.create({
            data: {
                designId,
                ownerId,
                sharedWithId: receiver.id,
                permission: permission ?? 'READ',
            },
        });

        await prisma.notification.create({
            data: {
                userId: receiver.id,
                message: `A design "${design.title}" was shared with you`,
                type: 'SUCCESS',
            },
        });

        // ================= WEB PUSH (NON-BLOCKING) ===============
        const subscription = await prisma.pushSubscription.findUnique({
            where: { userId: receiver.id },
        });

        if (subscription) {
            sendPushNotification(subscription.data as unknown as webpush.PushSubscription, {
                title: 'Design Shared',
                body: `A design "${design.title}" was shared with you`,
                designId: designId,
            }).catch(async (err: unknown) => {
                console.error('Push failed:', err);
                // If subscription is expired (410), remove it from DB
                if (err instanceof Error && 'statusCode' in err && (err as WebPushError).statusCode === 410) {
                    await prisma.pushSubscription.delete({
                        where: { userId: receiver.id },
                    }).catch((deleteErr: unknown) => {
                        console.error('Failed to delete expired subscription:', deleteErr);
                    });
                }
            });
        }

        return NextResponse.json({
            message: 'Design shared successfully',
        });
    } catch (error) {
        console.error('Share design error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
