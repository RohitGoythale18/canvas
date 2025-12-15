// src/app/api/designs/[id]/access/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    params: Promise<{
        id: string;
    }>;
}

// PATCH /api/designs/[id]/access
// Body: { isPublished: boolean }
export async function PATCH(req: Request, { params }: Params) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: 'Missing design id' },
            { status: 400 }
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch (error) {
        console.error(`PATCH /api/designs/${id}/access invalid JSON:`, error);
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    const { isPublished } = body as { isPublished?: boolean };

    if (typeof isPublished !== 'boolean') {
        return NextResponse.json(
            { error: 'isPublished (boolean) is required' },
            { status: 400 }
        );
    }

    try {
        const existing = await prisma.design.findUnique({
            where: { id },
        });

        if (!existing || existing.deletedAt) {
            return NextResponse.json(
                { error: 'Design not found' },
                { status: 404 }
            );
        }

        const updated = await prisma.design.update({
            where: { id },
            data: { isPublished },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error(`PATCH /api/designs/${id}/access failed:`, error);
        return NextResponse.json(
            { error: 'Failed to update access' },
            { status: 500 }
        );
    }
}
