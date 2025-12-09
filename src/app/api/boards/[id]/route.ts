import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
    try {
        const board = await prisma.board.findUnique({
            where: { id: params.id },
            include: {
                owner: { select: { id: true, name: true } },
                members: { include: { user: { select: { id: true, name: true, email: true } } } },
                designs: true
            }
        });
        if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(board);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: Params) {
    try {
        const body = await req.json();
        const updated = await prisma.board.update({
            where: { id: params.id },
            data: {
                name: body.name,
                description: body.description,
                isPublic: body.isPublic
            }
        });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Failed to update board' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    try {
        const boardId = params?.id;
        if (!boardId) {
            return NextResponse.json({ error: "Missing board id in route params" }, { status: 400 });
        }

        const existing = await prisma.board.findUnique({ where: { id: boardId } });
        if (!existing) {
            return NextResponse.json({ error: "Board not found" }, { status: 404 });
        }

        const hasDeletedAt = Object.prototype.hasOwnProperty.call(existing, "deletedAt");

        if (hasDeletedAt) {
            const updated = await prisma.board.update({
                where: { id: boardId },
                data: { deletedAt: new Date() },
            });
            return NextResponse.json({ ok: true, deletedAt: updated.deletedAt }, { status: 200 });
        } else {
            await prisma.board.delete({ where: { id: boardId } });
            return NextResponse.json({ ok: true }, { status: 200 });
        }
    } catch {
        return NextResponse.json(
            { error: "Failed to delete board" },
            { status: 500 }
        );
    }
}
