// src/app/api/designs/[id]/publish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;

    const { id: designId } = await context.params;
    const { isPublished } = await request.json();

    const result = await prisma.design.updateMany({
      where: {
        id: designId,
        ownerId: userId,
      },
      data: {
        isPublished,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    const updatedDesign = await prisma.design.findUnique({
      where: { id: designId },
      include: { board: true },
    });

    return NextResponse.json(updatedDesign);
  } catch (error) {
    console.error('Publish design error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
