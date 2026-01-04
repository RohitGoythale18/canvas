// src/app/api/designs/shared/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authRequest = authenticateRequest(req);
    const userId = authRequest.user!.userId;

    // Fetch designs shared with the user
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

    // Normalize the data to match the Pin interface
    const normalizedSharedDesigns = sharedDesigns.map((share) => ({
      id: share.design.id,
      title: share.design.title,
      imageUrl: share.design.thumbnailUrl,
      canvasData: share.design.data,
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
