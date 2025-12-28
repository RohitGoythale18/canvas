import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;
    const boardId = params.id;

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
      include: { designs: true },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('Get board error:', error);
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
    const boardId = params.id;
    const { name, description, isPublic } = await request.json();

    const board = await prisma.board.updateMany({
      where: { id: boardId, ownerId: userId },
      data: { name, description, isPublic },
    });

    if (board.count === 0) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    const updatedBoard = await prisma.board.findUnique({
      where: { id: boardId },
      include: { designs: true },
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error('Update board error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;
    const boardId = params.id;

    const board = await prisma.board.deleteMany({
      where: { id: boardId, ownerId: userId },
    });

    if (board.count === 0) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
