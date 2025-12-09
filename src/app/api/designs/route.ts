// src/app/api/designs/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const designs = await prisma.design.findMany({
            where: { deletedAt: null },
            include: {
                owner: { select: { id: true, name: true } },
                sharedRecords: true,
                board: { select: { id: true, name: true } },
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(designs);
    } catch {
        return NextResponse.json({ error: 'Failed to list designs' }, { status: 500 });
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
    } catch (err) {
        console.error('Failed to create design', err);
        return NextResponse.json({ error: 'Failed to create design' }, { status: 500 });
    }
}
