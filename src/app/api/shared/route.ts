import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

// GET /api/shares – optional, list all shares (debug/admin)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // Default 20, max 100
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const includeDesignData = searchParams.get('includeDesignData') === 'true'; // Default false - don't fetch large data field

        const shares = await prisma.sharedDesign.findMany({
            take: limit,
            skip: offset,
            include: {
                design: {
                    select: { 
                        id: true, 
                        title: true, 
                        description: true, 
                        thumbnailUrl: true, 
                        isPublished: true, 
                        createdAt: true, 
                        updatedAt: true, 
                        deletedAt: true, 
                        ownerId: true, 
                        boardId: true,
                        ...(includeDesignData ? { data: true } : {}) // Only include large data field if explicitly requested
                    }
                },
                sharedBy: { 
                    select: { id: true, name: true, deletedAt: true }
                },
                sharedWith: { 
                    select: { id: true, name: true, email: true, deletedAt: true }
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        
        // Filter out shares where related entities are deleted
        const validShares = shares.filter(share => 
            !share.design.deletedAt && 
            !share.sharedBy.deletedAt && 
            !share.sharedWith.deletedAt
        );
        
        return NextResponse.json(validShares);
    } catch (error) {
        return createErrorResponse(error, 'GET /api/shared', 'Failed to list shares');
    }
}

// POST /api/shares
// Body: { designId, sharedById, sharedWithEmail, role: 'viewer' | 'editor', message?, expiresAt? }
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            designId,
            sharedById,
            sharedWithEmail,
            role,
            message,
            expiresAt,
        } = body as {
            designId?: string;
            sharedById?: string;
            sharedWithEmail?: string;
            role?: 'viewer' | 'editor';
            message?: string;
            expiresAt?: string;
        };

        if (!designId) {
            return NextResponse.json({ error: 'designId is required' }, { status: 400 });
        }
        if (!sharedById) {
            return NextResponse.json({ error: 'sharedById is required' }, { status: 400 });
        }
        if (!sharedWithEmail) {
            return NextResponse.json({ error: 'sharedWithEmail is required' }, { status: 400 });
        }

        // Validate foreign key: designId must exist
        const design = await prisma.design.findUnique({
            where: { id: designId },
            select: { id: true, deletedAt: true },
        });

        if (!design) {
            return NextResponse.json(
                { error: `Design with id ${designId} not found` },
                { status: 404 }
            );
        }

        if (design.deletedAt) {
            return NextResponse.json(
                { error: `Design with id ${designId} has been deleted` },
                { status: 404 }
            );
        }

        // Validate foreign key: sharedById must exist
        const sharedByUser = await prisma.user.findUnique({
            where: { id: sharedById },
            select: { id: true, deletedAt: true },
        });

        if (!sharedByUser) {
            return NextResponse.json(
                { error: `User with id ${sharedById} not found` },
                { status: 404 }
            );
        }

        if (sharedByUser.deletedAt) {
            return NextResponse.json(
                { error: `User with id ${sharedById} has been deleted` },
                { status: 404 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: sharedWithEmail },
            select: { id: true, deletedAt: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User with that email does not exist' },
                { status: 404 }
            );
        }

        if (user.deletedAt) {
            return NextResponse.json(
                { error: 'User with that email has been deleted' },
                { status: 404 }
            );
        }

        const permission =
            role === 'editor'
                ? 'WRITE'
                : 'READ'; // maps UI role → Permission enum

        // Upsert: if already shared, just update permission/message/expiry
        const existing = await prisma.sharedDesign.findUnique({
            where: {
                designId_sharedWithId: {
                    designId,
                    sharedWithId: user.id,
                },
            },
        });

        if (existing) {
            const updated = await prisma.sharedDesign.update({
                where: { id: existing.id },
                data: {
                    permission,
                    message: message ?? existing.message,
                    expiresAt: expiresAt ? new Date(expiresAt) : existing.expiresAt,
                },
                include: {
                    sharedWith: { select: { id: true, email: true } },
                },
            });
            return NextResponse.json(updated, { status: 200 }); // 200 for update (upsert behavior)
        }

        const rec = await prisma.sharedDesign.create({
            data: {
                designId,
                sharedById,
                sharedWithId: user.id,
                permission,
                message: message ?? null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
            include: {
                sharedWith: { select: { id: true, email: true } },
            },
        });

        return NextResponse.json(rec, { status: 201 });
    } catch (error) {
        return createErrorResponse(error, 'POST /api/shared', 'Failed to create share');
    }
}
