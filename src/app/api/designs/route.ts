import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const limit = Math.min(
            parseInt(searchParams.get('limit') || '20', 10),
            100
        );
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const includeData = searchParams.get('includeData') === 'true';
        const includeSharedRecords =
            searchParams.get('includeSharedRecords') === 'true';

        const designs = await prisma.design.findMany({
            where: {
                deletedAt: null,

                // ✅ filter deleted owners
                owner: { deletedAt: null },

                // ✅ filter deleted boards (or allow null board)
                OR: [
                    { boardId: null },
                    { board: { deletedAt: null } },
                ],
            },

            take: limit,
            skip: offset,
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

                ...(includeData ? { data: true } : {}),

                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                board: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                ...(includeSharedRecords
                    ? {
                        sharedRecords: {
                            take: 10,
                            where: {
                                sharedWith: { deletedAt: null },
                            },
                            select: {
                                id: true,
                                permission: true,
                                message: true,
                                expiresAt: true,
                                createdAt: true,
                                sharedWith: {
                                    select: {
                                        id: true,
                                        email: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    }
                    : {}),
            },
        });

        return NextResponse.json(designs, { status: 200 });
    } catch (error) {
        return createErrorResponse(
            error,
            'GET /api/designs',
            'Failed to list designs'
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.title) {
            return NextResponse.json(
                { error: 'title is required' },
                { status: 400 }
            );
        }

        if (!body.ownerId) {
            return NextResponse.json(
                { error: 'ownerId is required' },
                { status: 400 }
            );
        }

        const owner = await prisma.user.findUnique({
            where: { id: body.ownerId },
            select: { id: true, deletedAt: true },
        });

        if (!owner || owner.deletedAt) {
            return NextResponse.json(
                { error: 'Owner not found or deleted' },
                { status: 404 }
            );
        }

        if (body.boardId) {
            const board = await prisma.board.findUnique({
                where: { id: body.boardId },
                select: { id: true, deletedAt: true },
            });

            if (!board || board.deletedAt) {
                return NextResponse.json(
                    { error: 'Board not found or deleted' },
                    { status: 404 }
                );
            }
        }

        const design = await prisma.design.create({
            data: {
                title: body.title,
                description: body.description ?? null,
                data: body.data ?? null,
                thumbnailUrl: body.thumbnailUrl ?? null,
                isPublished: body.isPublished ?? false,
                ownerId: body.ownerId,
                boardId: body.boardId ?? null,
            },
            include: {
                owner: true,
                board: true,
                sharedRecords: true,
            },
        });

        return NextResponse.json(design, { status: 201 });
    } catch (error) {
        return createErrorResponse(
            error,
            'POST /api/designs',
            'Failed to create design'
        );
    }
}
