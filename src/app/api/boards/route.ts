import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;

    const boards = await prisma.board.findMany({
      where: { ownerId: userId },
      include: {
        designs: {
          include: {
            owner: true,
          },
        },
      },
    });

    console.log('Fetched boards for user', userId, ':', boards.map(b => ({ id: b.id, name: b.name, designsCount: b.designs.length })));

    // Also log total designs for this user
    const totalDesigns = await prisma.design.count({
      where: { ownerId: userId },
    });
    console.log('Total designs for user', userId, ':', totalDesigns);

    return NextResponse.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authRequest = authenticateRequest(request);
    const userId = authRequest.user!.userId;
    const { name, description, isPublic } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const board = await prisma.board.create({
      data: {
        name,
        description,
        isPublic: isPublic || false,
        ownerId: userId,
      },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error('Create board error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
