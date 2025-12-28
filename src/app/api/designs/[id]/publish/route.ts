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
    const designId = params.id;
    const { isPublished } = await request.json();

    const design = await prisma.design.updateMany({
      where: { id: designId, ownerId: userId },
      data: { isPublished },
    });

    if (design.count === 0) {
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
