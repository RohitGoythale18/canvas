import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/shares/[id]
export async function GET(req: Request, { params }: Params) {
    const { id } = await params;
    try {
        const { searchParams } = new URL(req.url);
        const includeDesignData = searchParams.get('includeDesignData') === 'true'; // Default false - don't fetch large data field

        const rec = await prisma.sharedDesign.findUnique({
            where: { id },
            include: {
                design: {
                    select: { 
                        id: true, 
                        deletedAt: true, 
                        title: true, 
                        description: true, 
                        thumbnailUrl: true, 
                        isPublished: true, 
                        createdAt: true, 
                        updatedAt: true, 
                        ownerId: true, 
                        boardId: true,
                        ...(includeDesignData ? { data: true } : {}) // Only include large data field if explicitly requested
                    }
                },
                sharedBy: {
                    select: { id: true, email: true, name: true, deletedAt: true, createdAt: true, updatedAt: true }
                },
                sharedWith: {
                    select: { id: true, email: true, name: true, deletedAt: true, createdAt: true, updatedAt: true }
                },
            },
        });
        
        if (!rec) {
            return NextResponse.json({ error: 'Share not found' }, { status: 404 });
        }

        // Check if related entities are deleted
        if (!rec.design || rec.design.deletedAt) {
            return NextResponse.json({ error: 'Design associated with this share has been deleted' }, { status: 404 });
        }

        if (!rec.sharedBy || rec.sharedBy.deletedAt) {
            return NextResponse.json({ error: 'User who shared this design has been deleted' }, { status: 404 });
        }

        if (!rec.sharedWith || rec.sharedWith.deletedAt) {
            return NextResponse.json({ error: 'User this was shared with has been deleted' }, { status: 404 });
        }

        return NextResponse.json(rec);
    } catch (error) {
        return createErrorResponse(error, `GET /api/shared/${id}`, 'Failed to fetch share');
    }
}

// PATCH /api/shares/[id]
// Body: { role: 'viewer' | 'editor' }
export async function PATCH(req: Request, { params }: Params) {
    const { id } = await params;
    try {
        // Check if share exists and related entities are not deleted
        const existing = await prisma.sharedDesign.findUnique({
            where: { id },
            include: {
                design: { select: { id: true, deletedAt: true } },
                sharedBy: { select: { id: true, deletedAt: true } },
                sharedWith: { select: { id: true, deletedAt: true } },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Share not found' }, { status: 404 });
        }

        if (!existing.design || existing.design.deletedAt) {
            return NextResponse.json({ error: 'Design associated with this share has been deleted' }, { status: 404 });
        }

        if (!existing.sharedBy || existing.sharedBy.deletedAt) {
            return NextResponse.json({ error: 'User who shared this design has been deleted' }, { status: 404 });
        }

        if (!existing.sharedWith || existing.sharedWith.deletedAt) {
            return NextResponse.json({ error: 'User this was shared with has been deleted' }, { status: 404 });
        }

        const body = await req.json();
        const { role } = body as { role?: 'viewer' | 'editor' };

        if (!role) {
            return NextResponse.json({ error: 'role is required' }, { status: 400 });
        }

        const permission =
            role === 'editor'
                ? 'WRITE'
                : 'READ'; // map UI role → Permission enum

        const updated = await prisma.sharedDesign.update({
            where: { id },
            data: { permission },
            include: {
                sharedWith: { select: { id: true, email: true } },
            },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return createErrorResponse(error, `PATCH /api/shared/${id}`, 'Failed to update share permission');
    }
}

// DELETE /api/shares/[id]
export async function DELETE(_req: Request, { params }: Params) {
    const { id } = await params;
    try {
        // Check if share exists
        const existing = await prisma.sharedDesign.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Share not found' }, { status: 404 });
        }

        await prisma.sharedDesign.delete({ where: { id } });
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        return createErrorResponse(error, `DELETE /api/shared/${id}`, 'Failed to revoke share');
    }
}
