// src/app/api/designs/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

interface Params {
    params: Promise<{
        id: string;
    }>;
}

// GET /api/designs/[id]
export async function GET(req: Request, { params }: Params) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing design id' }, { status: 400 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const includeSharedRecords = searchParams.get('includeSharedRecords') !== 'false'; // Default true
        const sharedRecordsLimit = parseInt(searchParams.get('sharedRecordsLimit') || '20', 10); // Limit shared records

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
                    select: { id: true, name: true, email: true, deletedAt: true }
                },
                board: {
                    select: { id: true, name: true, deletedAt: true }
                },
                ...(includeSharedRecords ? {
                    sharedRecords: {
                        take: sharedRecordsLimit,
                        select: {
                            id: true,
                            permission: true,
                            message: true,
                            expiresAt: true,
                            createdAt: true,
                            sharedWith: {
                                select: { id: true, email: true, name: true }
                            },
                            sharedBy: {
                                select: { id: true, email: true, name: true }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    }
                } : {})
            },
        });

        if (!design || design.deletedAt) {
            return NextResponse.json({ error: 'Design not found' }, { status: 404 });
        }

        return NextResponse.json(design);
    } catch (error) {
        return createErrorResponse(error, `GET /api/designs/${id}`, 'Failed to fetch design');
    }
}

// PUT /api/designs/[id] – update design details (including isPublished)
export async function PUT(req: Request, { params }: Params) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing design id' }, { status: 400 });
    }

    try {
        // Check if design exists and is not deleted
        const existing = await prisma.design.findUnique({
            where: { id },
            select: { id: true, deletedAt: true },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Design not found' }, { status: 404 });
        }

        if (existing.deletedAt) {
            return NextResponse.json({ error: 'Design has been deleted' }, { status: 404 });
        }

        const body = await req.json();

        // Validate foreign key: boardId must exist if provided
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
        return createErrorResponse(error, `PUT /api/designs/${id}`, 'Failed to update design');
    }
}

// DELETE /api/designs/[id] – soft delete (sets deletedAt)
export async function DELETE(_req: Request, { params }: Params) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing design id' }, { status: 400 });
    }

    try {
        // Ensure it exists
        const existing = await prisma.design.findUnique({ where: { id } });

        if (!existing || existing.deletedAt) {
            return NextResponse.json({ error: 'Design not found' }, { status: 404 });
        }

        await prisma.design.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                // optional: also unpublish when deleting
                isPublished: false,
            },
        });

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        return createErrorResponse(error, `DELETE /api/designs/${id}`, 'Failed to delete design');
    }
}
