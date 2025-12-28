import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;
    const notificationId = params.id;

    const notification = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });

    if (notification.count === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const updatedNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
