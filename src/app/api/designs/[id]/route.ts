// src/app/api/designs/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/designs/[id]
 */
export async function GET(req: Request, { params }: Params) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: 'Missing design id' },
            { status: 400 }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const includeSharedRecords =
            searchParams.get('includeSharedRecords') !== 'false'; // default true
        const sharedRecordsLimit = parseInt(
            searchParams.get('sharedRecordsLimit') || '20',
            10
        );

        const design = await prisma.design.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                data: true,
                thumbnailUrl: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
                ownerId: true,
                boardId: true,
                deletedAt: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        deletedAt: true,
                    },
                },
                board: {
                    select: {
                        id: true,
                        name: true,
                        deletedAt: true,
                    },
                },
                ...(includeSharedRecords
                    ? {
                        sharedRecords: {
                            take: sharedRecordsLimit,
                            orderBy: { createdAt: 'desc' },
                            select: {
                                id: true,
                                permission: true,
                                message: true,
                                expiresAt: true,
                                createdAt: true,
                                sharedWith: {
                                    select: { id: true, email: true, name: true },
                                },
                                sharedBy: {
                                    select: { id: true, email: true, name: true },
                                },
                            },
                        },
                    }
                    : {}),
            },
        });

        if (!design || design.deletedAt) {
            return NextResponse.json(
                { error: 'Design not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(design, { status: 200 });
    } catch (error) {
        console.error(`GET /api/designs/${id} failed:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch design' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/designs/[id]
 */
export async function PUT(req: Request, { params }: Params) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: 'Missing design id' },
            { status: 400 }
        );
    }

    try {
        const existing = await prisma.design.findUnique({
            where: { id },
            select: { id: true, deletedAt: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Design not found' },
                { status: 404 }
            );
        }

        if (existing.deletedAt) {
            return NextResponse.json(
                { error: 'Design has been deleted' },
                { status: 404 }
            );
        }

        const body = await req.json();

        // validate boardId if provided
        if (body.boardId !== null && body.boardId !== undefined) {
            const board = await prisma.board.findUnique({
                where: { id: body.boardId },
                select: { id: true, deletedAt: true },
            });

            if (!board) {
                return NextResponse.json(
                    { error: `Board with id ${body.boardId} not found` },
                    { status: 404 }
                );
            }

            if (board.deletedAt) {
                return NextResponse.json(
                    { error: `Board with id ${body.boardId} has been deleted` },
                    { status: 404 }
                );
            }
        }

        const updated = await prisma.design.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                data: body.data,
                thumbnailUrl: body.thumbnailUrl ?? null,
                isPublished: body.isPublished ?? false,
                boardId: body.boardId ?? null,
            },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error(`PUT /api/designs/${id} failed:`, error);
        return NextResponse.json(
            { error: 'Failed to update design' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/designs/[id]
 * Soft delete (sets deletedAt)
 */
export async function DELETE(_req: Request, { params }: Params) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: 'Missing design id' },
            { status: 400 }
        );
    }

    try {
        const existing = await prisma.design.findUnique({
            where: { id },
        });

        if (!existing || existing.deletedAt) {
            return NextResponse.json(
                { error: 'Design not found' },
                { status: 404 }
            );
        }

        await prisma.design.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isPublished: false, // unpublish on delete
            },
        });

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error(`DELETE /api/designs/${id} failed:`, error);
        return NextResponse.json(
            { error: 'Failed to delete design' },
            { status: 500 }
        );
    }
}
