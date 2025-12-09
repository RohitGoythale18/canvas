// src/app/api/boards/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const boards = await prisma.board.findMany({
            where: { deletedAt: null },
            include: {
                owner: { select: { id: true, name: true } },
                members: { include: { user: { select: { id: true, name: true } } } },
                designs: {
                    where: { deletedAt: null },
                    // don't include storedImages (no such relation). include only valid relations/fields:
                    include: {
                        owner: { select: { id: true, name: true } },
                        board: { select: { id: true, name: true } },
                        sharedRecords: true
                    },
                    orderBy: { updatedAt: 'desc' }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(boards);
    } catch (err) {
        console.error('Failed to fetch boards', err);
        return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!body?.name || !body?.ownerId) {
            return NextResponse.json({ error: 'Missing name or ownerId' }, { status: 400 });
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
    } catch (err) {
        console.error('Failed to create board', err);
        return NextResponse.json({ error: 'Failed to create board' }, { status: 500 });
    }
}
