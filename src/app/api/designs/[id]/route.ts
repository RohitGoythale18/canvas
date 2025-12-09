// src/app/api/designs/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
    try {
        const design = await prisma.design.findUnique({
            where: { id: params.id },
            include: { owner: true, sharedRecords: true, board: true }
        });
        if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(design);
    } catch (err) {
        console.error('Failed to fetch design', err);
        return NextResponse.json({ error: 'Failed to fetch design' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: Params) {
    try {
        const body = await req.json();

        const updated = await prisma.design.update({
            where: { id: params.id },
            data: {
                title: body.title,
                description: body.description,
                data: body.data,
                thumbnailUrl: body.thumbnailUrl ?? null,
                isPublished: body.isPublished ?? false,
                boardId: body.boardId ?? null
            }
        });

        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Failed to update design' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        await prisma.design.update({
            where: { id: params.id },
            data: { deletedAt: new Date() }
        });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('Failed to delete design', err);
        return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
    }
}
