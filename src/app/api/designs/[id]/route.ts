import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await context.params;

    if (!designId) {
      return NextResponse.json(
        { error: 'Design ID missing' },
        { status: 400 }
      );
    }

    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;

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

    const isOwner = design.ownerId === userId;
    const sharedEntry = design.sharedWith[0];
    const isShared = Boolean(sharedEntry);

    if (!isOwner && !isShared) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const permission = isOwner
      ? 'OWNER'
      : sharedEntry?.permission ?? 'READ';

    const designWithImage = {
      ...design,
      permission,
      data: design.image
        ? {
          ...(design.data as Record<string, unknown>),
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;

    const { id: designId } = await context.params;
    const { title, description, data } = await request.json();

    const result = await prisma.design.updateMany({
      where: {
        id: designId,
        ownerId: userId,
      },
      data: {
        title,
        description,
        data,
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
    console.error('Update design error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;

    const { id: designId } = await context.params;

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
