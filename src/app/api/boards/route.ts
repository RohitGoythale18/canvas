import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/boards
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const limit = Math.min(
            parseInt(searchParams.get('limit') || '20', 10),
            100
        );
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const includeDesigns = searchParams.get('includeDesigns') !== 'false';
        const designsLimit = parseInt(
            searchParams.get('designsLimit') || '10',
            10
        );

        const boards = await prisma.board.findMany({
            where: {
                deletedAt: null,

                // filter out boards whose owner is deleted
                owner: { deletedAt: null },
            },
            take: limit,
            skip: offset,
            orderBy: { updatedAt: 'desc' },

            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                // filter deleted users at DB level
                members: {
                    where: {
                        user: { deletedAt: null },
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },

                ...(includeDesigns
                    ? {
                        designs: {
                            where: {
                                deletedAt: null,

                                // filter deleted design owners
                                owner: { deletedAt: null },

                                // filter designs whose board is deleted
                                OR: [
                                    { boardId: null },
                                    { board: { deletedAt: null } },
                                ],
                            },
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
                            },
                        },
                    }
                    : {}),
            },
        });

        return NextResponse.json(boards, { status: 200 });
    } catch (error) {
        console.error('GET /api/boards failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch boards' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/boards
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body?.name || !body?.ownerId) {
            return NextResponse.json(
                { error: 'Missing name or ownerId' },
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

        const created = await prisma.board.create({
            data: {
                name: body.name,
                description: body.description ?? null,
                ownerId: body.ownerId,
                isPublic: body.isPublic ?? false,
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                ownerId: true,
            },
        });

        return NextResponse.json(
            {
                ...created,
                owner: { id: created.ownerId },
                members: [],
                designs: [],
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('POST /api/boards failed:', error);
        return NextResponse.json(
            { error: 'Failed to create board' },
            { status: 500 }
        );
    }
}
