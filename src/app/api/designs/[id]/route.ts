// src/app/api/designs/[id]/route.ts
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
    const userPermission = sharedEntry?.permission;

    // Check if user has at least READ permission
    const hasReadPermission = isOwner || (userPermission === 'READ' || userPermission === 'COMMENT' || userPermission === 'WRITE');

    if (!hasReadPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const permission = isOwner
      ? 'OWNER'
      : userPermission ?? 'READ';

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
    const { title, description, data, thumbnailUrl, image } = await request.json();

    // Check permissions first
    const design = await prisma.design.findUnique({
      where: { id: designId },
      include: {
        sharedWith: {
          where: { sharedWithId: userId },
          select: {
            permission: true,
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
    const hasWritePermission = sharedEntry?.permission === 'WRITE';

    if (!isOwner && !hasWritePermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update the design
    await prisma.design.update({
      where: { id: designId },
      data: {
        title,
        description,
        data,
        thumbnailUrl,
        image,
      },
    });

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
