// src/app/api/boards/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

// GET /api/boards/[id]
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const { searchParams } = new URL(req.url);

        const includeDesigns =
            searchParams.get('includeDesigns') !== 'false'; // default true
        const designsLimit = parseInt(
            searchParams.get('designsLimit') || '20',
            10
        );
        const includeDesignData =
            searchParams.get('includeDesignData') === 'true';

        const board = await prisma.board.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        deletedAt: true,
                    },
                },

                // ✅ Filter soft-deleted users at DB level
                members: {
                    where: {
                        user: { deletedAt: null },
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                deletedAt: true,
                            },
                        },
                    },
                },

                ...(includeDesigns
                    ? {
                        designs: {
                            where: { deletedAt: null },
                            take: designsLimit,
                            orderBy: { updatedAt: 'desc' },
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

                                ...(includeDesignData ? { data: true } : {}),

                                owner: {
                                    select: {
                                        id: true,
                                        name: true,
                                        deletedAt: true,
                                    },
                                },
                            },
                        },
                    }
                    : {}),
            },
        });

        if (!board) {
            return NextResponse.json(
                { error: 'Board not found' },
                { status: 404 }
            );
        }

        if (board.deletedAt) {
            return NextResponse.json(
                { error: 'Board has been deleted' },
                { status: 404 }
            );
        }

        if (board.owner?.deletedAt) {
            return NextResponse.json(
                { error: 'Board owner has been deleted' },
                { status: 404 }
            );
        }

        return NextResponse.json(board, { status: 200 });
    } catch (error) {
        return createErrorResponse(
            error,
            `GET /api/boards/${id}`,
            'Failed to fetch board'
        );
    }
}

// PUT /api/boards/[id]
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const existing = await prisma.board.findUnique({
            where: { id },
            select: { id: true, deletedAt: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Board not found' },
                { status: 404 }
            );
        }

        if (existing.deletedAt) {
            return NextResponse.json(
                { error: 'Board has been deleted' },
                { status: 404 }
            );
        }

        const body = await req.json();

        const updated = await prisma.board.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                isPublic: body.isPublic,
            },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return createErrorResponse(
            error,
            `PUT /api/boards/${id}`,
            'Failed to update board'
        );
    }
}

// DELETE /api/boards/[id]
export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const existing = await prisma.board.findUnique({
            where: { id },
            select: { id: true, deletedAt: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Board not found' },
                { status: 404 }
            );
        }

        if (existing.deletedAt) {
            return NextResponse.json(
                { error: 'Board already deleted' },
                { status: 404 }
            );
        }

        await prisma.board.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        return createErrorResponse(
            error,
            `DELETE /api/boards/${id}`,
            'Failed to delete board'
        );
    }
}
