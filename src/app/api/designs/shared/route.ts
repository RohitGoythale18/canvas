// src/app/api/designs/shared/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authRequest = authenticateRequest(req);
    const userId = authRequest.user!.userId;

    const sharedDesigns = await prisma.sharedDesign.findMany({
      where: {
        sharedWithId: userId,
      },
      include: {
        design: {
          include: {
            board: true,
            owner: true,
          },
        },
      },
    });

    const normalizedSharedDesigns = sharedDesigns.map((share) => ({
      id: share.design.id,
      title: share.design.title,
      thumbnailUrl: share.design.thumbnailUrl,
      data: share.design.data,
      createdAt: share.design.createdAt,
      ownerId: share.design.ownerId,
      owner: share.design.owner,
    }));

    return NextResponse.json(normalizedSharedDesigns);
  } catch (error) {
    console.error('Get shared designs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
