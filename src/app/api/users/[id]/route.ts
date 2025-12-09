import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: { id: true, email: true, name: true, createdAt: true }
        });
        if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(user);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: Params) {
    try {
        const body = await req.json();
        const updated = await prisma.user.update({
            where: { id: params.id },
            data: {
                name: body.name,
            },
            select: { id: true, email: true, name: true, updatedAt: true }
        });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        await prisma.user.update({
            where: { id: params.id },
            data: { deletedAt: new Date() }
        });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
