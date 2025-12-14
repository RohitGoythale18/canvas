import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

// GET /api/boards/[id]
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    try {
        const { searchParams } = new URL(req.url);
        const includeDesigns = searchParams.get('includeDesigns') !== 'false'; // Default true
        const designsLimit = parseInt(searchParams.get('designsLimit') || '20', 10); // Limit designs
        const includeDesignData = searchParams.get('includeDesignData') === 'true'; // Default false

        const board = await prisma.board.findUnique({
            where: { id },
            include: {
                owner: { 
                    select: { id: true, name: true, deletedAt: true }
                },
                members: {
                    include: {
                        user: { 
                            select: { id: true, name: true, email: true, deletedAt: true }
                        }
                    }
                },
                ...(includeDesigns ? {
                    designs: {
                        where: { deletedAt: null }, // Filter soft-deleted designs
                        take: designsLimit,
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            thumbnailUrl: true,
                            isPublished: true,
                            createdAt: true,
                            updatedAt: true,
                            ownerId: true,
                            boardId: true,
                            ...(includeDesignData ? { data: true } : {}), // Only include large data field if explicitly requested
                            owner: {
                                select: { id: true, name: true, deletedAt: true }
                            }
                        },
                        orderBy: { updatedAt: 'desc' }
                    }
                } : {})
            }
        });

        if (!board) {
            return NextResponse.json({ error: 'Board not found' }, { status: 404 });
        }

        // Check if board is soft-deleted
        if (board.deletedAt) {
            return NextResponse.json({ error: 'Board has been deleted' }, { status: 404 });
        }

        // Filter out soft-deleted related entities
        if (board.owner?.deletedAt) {
            return NextResponse.json({ error: 'Board owner has been deleted' }, { status: 404 });
        }
        board.members = board.members.filter(member => !member.user.deletedAt);

        return NextResponse.json(board);

    } catch (error) {
        return createErrorResponse(error, `GET /api/boards/${id}`, 'Failed to fetch board');
    }
}

// PUT /api/boards/[id]
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    try {
        // Check if board exists and is not deleted
        const existing = await prisma.board.findUnique({
            where: { id },
            select: { id: true, deletedAt: true }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Board not found' }, { status: 404 });
        }

        if (existing.deletedAt) {
            return NextResponse.json({ error: 'Board has been deleted' }, { status: 404 });
        }

        const body = await req.json();

        const updated = await prisma.board.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                isPublic: body.isPublic
            }
        });

        return NextResponse.json(updated, { status: 200 });

    } catch (error) {
        return createErrorResponse(error, `PUT /api/boards/${id}`, 'Failed to update board');
    }
}

// DELETE /api/boards/[id]
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    try {
        const existing = await prisma.board.findUnique({ 
            where: { id },
            select: { id: true, deletedAt: true }
        });

        if (!existing) {
            return NextResponse.json({ error: "Board not found" }, { status: 404 });
        }

        // Check if already deleted
        if (existing.deletedAt) {
            return NextResponse.json({ error: "Board has already been deleted" }, { status: 404 });
        }

        // Soft delete
        await prisma.board.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ ok: true }, { status: 200 });

    } catch (error) {
        return createErrorResponse(error, `DELETE /api/boards/${id}`, 'Failed to delete board');
    }
}
