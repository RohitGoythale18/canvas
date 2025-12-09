import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const shares = await prisma.sharedDesign.findMany({
            include: { design: true, sharedBy: { select: { id: true, name: true } }, sharedWith: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(shares);
    } catch {
        return NextResponse.json({ error: 'Failed to list shares' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // expects { designId, sharedById, sharedWithId, permission, message?, expiresAt? }
        const rec = await prisma.sharedDesign.create({
            data: {
                designId: body.designId,
                sharedById: body.sharedById,
                sharedWithId: body.sharedWithId,
                permission: body.permission ?? 'READ',
                message: body.message ?? null,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null
            }
        });
        return NextResponse.json(rec, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
    }
}
