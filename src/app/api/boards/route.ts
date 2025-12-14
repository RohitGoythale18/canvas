// src/app/api/boards/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/errorHandler';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // Default 20, max 100
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const includeDesigns = searchParams.get('includeDesigns') !== 'false'; // Default true
        const designsLimit = parseInt(searchParams.get('designsLimit') || '10', 10); // Limit designs per board

        const boards = await prisma.board.findMany({
            where: { deletedAt: null },
            take: limit,
            skip: offset,
            include: {
                owner: { 
                    select: { id: true, name: true, deletedAt: true }
                },
                members: { 
                    include: { 
                        user: { 
                            select: { id: true, name: true, deletedAt: true }
                        } 
                    } 
                },
                ...(includeDesigns ? {
                    designs: {
                        where: { deletedAt: null },
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
                            owner: { 
                                select: { id: true, name: true, deletedAt: true }
                            },
                            board: { 
                                select: { id: true, name: true, deletedAt: true }
                            },
                            // Exclude large data field and sharedRecords for list view
                        },
                        orderBy: { updatedAt: 'desc' }
                    }
                } : {})
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Filter out boards where owner is deleted, and filter members/users
        const validBoards = boards
            .filter(board => !board.owner.deletedAt)
            .map(board => {
                const baseResult = {
                    ...board,
                    members: board.members.filter(member => !member.user.deletedAt),
                };
                if (includeDesigns && 'designs' in board && Array.isArray(board.designs)) {
                    return {
                        ...baseResult,
                        designs: board.designs.filter((design: any) => 
                            design.owner && !design.owner.deletedAt && 
                            (!design.board || !design.board.deletedAt)
                        ),
                    };
                }
                return baseResult;
            });

        return NextResponse.json(validBoards);
    } catch (error) {
        return createErrorResponse(error, 'GET /api/boards', 'Failed to fetch boards');
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!body?.name || !body?.ownerId) {
            return NextResponse.json({ error: 'Missing name or ownerId' }, { status: 400 });
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

        const created = await prisma.board.create({
            data: {
                name: body.name,
                description: body.description ?? null,
                ownerId: body.ownerId,
                isPublic: body.isPublic ?? false
            }
        });

        const normalized = {
            id: created.id,
            name: created.name,
            description: created.description,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
            owner: { id: created.ownerId },
            designs: []
        };

        return NextResponse.json(normalized, { status: 201 });
    } catch (error) {
        return createErrorResponse(error, 'POST /api/boards', 'Failed to create board');
    }
}
