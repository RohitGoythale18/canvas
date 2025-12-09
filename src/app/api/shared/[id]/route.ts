import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
    try {
        const rec = await prisma.sharedDesign.findUnique({
            where: { id: params.id },
            include: { design: true, sharedBy: true, sharedWith: true }
        });
        if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(rec);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        await prisma.sharedDesign.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Failed to revoke share' }, { status: 500 });
    }
}
