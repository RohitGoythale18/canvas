import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await params;

    if (!designId) {
      return NextResponse.json(
        { error: 'Design ID missing' },
        { status: 400 }
      );
    }

    // authenticate user
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;

    // fetch design + shared access info
    const design = await prisma.design.findUnique({
      where: { id: designId },
      include: {
        board: true,
        sharedWith: {
          where: { sharedWithId: userId },
          select: {
            permission: true,
            sharedWithId: true,
          },
        },
      },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    // access rules
    const isOwner = design.ownerId === userId;
    const sharedEntry = design.sharedWith[0]; // at most one per user
    const isShared = Boolean(sharedEntry);

    if (!isOwner && !isShared /* && !isPublic */) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // attach permission info for frontend
    const permission = isOwner ? 'OWNER' : sharedEntry?.permission ?? 'READ';

    // include image inside canvas data if present
    const designWithImage = {
      ...design,
      permission, // IMPORTANT for frontend (READ / WRITE / OWNER)
      data: design.image
        ? {
          ...design.data,
          uploadedImageBase64: design.image,
        }
        : design.data,
    };

    return NextResponse.json(designWithImage);
  } catch (error) {
    console.error('Get design error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;
    const designId = params.id;
    const { title, description, data } = await request.json();

    const design = await prisma.design.updateMany({
      where: { id: designId, ownerId: userId },
      data: { title, description, data },
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
    console.error('Update design error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;

    const { id: designId } = await params;

    if (!designId) {
      return NextResponse.json(
        { error: 'Design ID missing' },
        { status: 400 }
      );
    }

    const design = await prisma.design.findUnique({
      where: { id: designId },
      select: { id: true, ownerId: true },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    if (design.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.design.delete({
      where: { id: designId },
    });

    return NextResponse.json({
      message: 'Design deleted successfully',
    });
  } catch (error) {
    console.error('Delete design error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

