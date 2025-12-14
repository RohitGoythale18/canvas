// src/app/api/designs/[id]/shares/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

type RoleString = 'viewer' | 'editor';

type RouteContext = {
    params: Promise<{ id: string }>;
};

function roleToPermission(role: RoleString | string) {
    // Map UI role to Prisma Permission enum
    if (role === 'editor') return 'WRITE';
    // default viewer
    return 'READ';
}

function permissionToRole(permission: string): RoleString {
    if (permission === 'WRITE') return 'editor';
    return 'viewer';
}

// GET /api/designs/[id]/shares
export async function GET(req: Request, context: RouteContext) {
    const { id: designId } = await context.params;

    if (!designId) {
        return NextResponse.json({ error: 'Missing design id' }, { status: 400 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // Default 20, max 100
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const design = await prisma.design.findUnique({
            where: { id: designId },
            select: { id: true, deletedAt: true },
        });

        if (!design || design.deletedAt) {
            return NextResponse.json({ error: 'Design not found' }, { status: 404 });
        }

        const shares = await prisma.sharedDesign.findMany({
            where: { designId },
            take: limit,
            skip: offset,
            include: {
                sharedWith: { 
                    select: { id: true, email: true, name: true, deletedAt: true }
                },
                sharedBy: { 
                    select: { id: true, email: true, name: true, deletedAt: true }
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Filter out shares where related users are deleted
        const validShares = shares.filter(share => 
            !share.sharedWith.deletedAt && !share.sharedBy.deletedAt
        );

        return NextResponse.json(validShares);
    } catch (error) {
        return createErrorResponse(error, `GET /api/designs/${designId}/shares`, 'Failed to load shares');
    }
}

// POST /api/designs/[id]/shares
// Body: { email: string; role?: 'viewer' | 'editor'; sharedById: string; message?: string; expiresAt?: string }
export async function POST(req: Request, context: RouteContext) {
    const { id: designId } = await context.params;

    if (!designId) {
        return NextResponse.json({ error: 'Missing design id' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const {
            email,
            role = 'viewer',
            sharedById,
            message,
            expiresAt,
        }: {
            email?: string;
            role?: RoleString;
            sharedById?: string;
            message?: string;
            expiresAt?: string;
        } = body || {};

        if (!email || !email.trim()) {
            return NextResponse.json({ error: 'email is required' }, { status: 400 });
        }
        if (!sharedById) {
            return NextResponse.json(
                { error: 'sharedById is required' },
                { status: 400 },
            );
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

        const normalizedEmail = email.trim().toLowerCase();

        // Find or create the user we are sharing *with*
        let sharedWithUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, deletedAt: true },
        });

        if (!sharedWithUser) {
            sharedWithUser = await prisma.user.create({
                data: {
                    email: normalizedEmail,
                    // bare user – can be completed later
                },
                select: { id: true, deletedAt: true },
            });
        } else if (sharedWithUser.deletedAt) {
            return NextResponse.json(
                { error: 'User with that email has been deleted' },
                { status: 404 }
            );
        }

        const permission = roleToPermission(role);

        // Because you have @@unique([designId, sharedWithId])
        // Prisma exposes this as `designId_sharedWithId` in `where`
        const rec = await prisma.sharedDesign.upsert({
            where: {
                designId_sharedWithId: {
                    designId,
                    sharedWithId: sharedWithUser.id,
                },
            },
            update: {
                permission,
                message: message ?? null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
            create: {
                designId,
                sharedById,
                sharedWithId: sharedWithUser.id,
                permission,
                message: message ?? null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
            include: {
                sharedWith: { select: { id: true, email: true, name: true } },
                sharedBy: { select: { id: true, email: true, name: true } },
            },
        });

        return NextResponse.json(rec, { status: 201 });
    } catch (error) {
        return createErrorResponse(error, `POST /api/designs/${designId}/shares`, 'Failed to create share');
    }
}

// PATCH /api/designs/[id]/shares
// Body: { shareId: string; role: 'viewer' | 'editor' }
export async function PATCH(req: Request, context: RouteContext) {
    const { id: designId } = await context.params;

    if (!designId) {
        return NextResponse.json({ error: 'Missing design id' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { shareId, role }: { shareId?: string; role?: RoleString } =
            body || {};

        if (!shareId) {
            return NextResponse.json({ error: 'shareId is required' }, { status: 400 });
        }
        if (!role) {
            return NextResponse.json({ error: 'role is required' }, { status: 400 });
        }

        const permission = roleToPermission(role);

        const existing = await prisma.sharedDesign.findUnique({
            where: { id: shareId },
            select: { id: true, designId: true },
        });

        if (!existing || existing.designId !== designId) {
            return NextResponse.json({ error: 'Share not found' }, { status: 404 });
        }

        const updated = await prisma.sharedDesign.update({
            where: { id: shareId },
            data: { permission },
            include: {
                sharedWith: { select: { id: true, email: true, name: true } },
            },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return createErrorResponse(error, `PATCH /api/designs/${designId}/shares`, 'Failed to update permission');
    }
}
