// src/app/api/designs/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // Default 20, max 100
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const includeData = searchParams.get('includeData') === 'true'; // Default false - don't fetch large data field
        const includeSharedRecords = searchParams.get('includeSharedRecords') === 'true'; // Default false

        const designs = await prisma.design.findMany({
            where: { deletedAt: null },
            take: limit,
            skip: offset,
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
                    select: { id: true, name: true, deletedAt: true }
                },
                board: { 
                    select: { id: true, name: true, deletedAt: true }
                },
                ...(includeSharedRecords ? {
                    sharedRecords: {
                        take: 10, // Limit shared records
                        select: {
                            id: true,
                            permission: true,
                            message: true,
                            expiresAt: true,
                            createdAt: true,
                            sharedWith: {
                                select: { id: true, email: true, name: true }
                            }
                        }
                    }
                } : {})
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Filter out designs where owner or board is deleted
        const validDesigns = designs.filter(design => 
            !design.owner.deletedAt && 
            (!design.board || !design.board.deletedAt)
        );

        return NextResponse.json(validDesigns);
    } catch (error) {
        return createErrorResponse(error, 'GET /api/designs', 'Failed to list designs');
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.title) {
            return NextResponse.json({ error: 'title is required' }, { status: 400 });
        }
        if (!body.ownerId) {
            return NextResponse.json({ error: 'ownerId is required' }, { status: 400 });
        }

        // Validate foreign key: ownerId must exist
        const owner = await prisma.user.findUnique({
            where: { id: body.ownerId },
            select: { id: true, deletedAt: true },
        });

        if (!owner) {
            return NextResponse.json(
                { error: `User with id ${body.ownerId} not found` },
                { status: 404 }
            );
        }

        if (owner.deletedAt) {
            return NextResponse.json(
                { error: `User with id ${body.ownerId} has been deleted` },
                { status: 404 }
            );
        }

        // Validate foreign key: boardId must exist if provided
        if (body.boardId) {
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

        const dataToCreate = {
            title: body.title,
            description: body.description ?? null,
            data: body.data ?? null, // { shapes: [...], images: [{id, url, fileName, ...}], ... }
            thumbnailUrl: body.thumbnailUrl ?? null,
            isPublished: body.isPublished ?? false,
            ownerId: body.ownerId,
            boardId: body.boardId ?? null,
        };

        const design = await prisma.design.create({
            data: dataToCreate,
            include: { owner: true, board: true, sharedRecords: true }
        });

        return NextResponse.json(design, { status: 201 });
    } catch (error) {
        return createErrorResponse(error, 'POST /api/designs', 'Failed to create design');
    }
}
