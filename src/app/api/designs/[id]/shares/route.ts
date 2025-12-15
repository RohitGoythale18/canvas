import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RoleString = 'viewer' | 'editor';

type RouteContext = {
    params: Promise<{ id: string }>;
};

function roleToPermission(role: RoleString | string) {
    if (role === 'editor') return 'WRITE';
    return 'READ';
}

function permissionToRole(permission: string): RoleString {
    if (permission === 'WRITE') return 'editor';
    return 'viewer';
}

/**
 * GET /api/designs/[id]/shares
 */
export async function GET(req: Request, context: RouteContext) {
    const { id: designId } = await context.params;

    if (!designId) {
        return NextResponse.json({ error: 'Missing design id' }, { status: 400 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const design = await prisma.design.findUnique({
            where: { id: designId },
            select: { id: true, deletedAt: true },
        });

        if (!design || design.deletedAt) {
            return NextResponse.json({ error: 'Design not found' }, { status: 404 });
        }

        const shares = await prisma.sharedDesign.findMany({
            where: {
                designId,
                sharedWith: { deletedAt: null },
                sharedBy: { deletedAt: null },
            },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'asc' },
            include: {
                sharedWith: {
                    select: { id: true, email: true, name: true },
                },
                sharedBy: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        return NextResponse.json(shares, { status: 200 });
    } catch (error) {
        console.error(`GET /api/designs/${designId}/shares failed:`, error);
        return NextResponse.json(
            { error: 'Failed to load shares' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/designs/[id]/shares
 */
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

        if (!email?.trim()) {
            return NextResponse.json({ error: 'email is required' }, { status: 400 });
        }

        if (!sharedById) {
            return NextResponse.json(
                { error: 'sharedById is required' },
                { status: 400 }
            );
        }

        const design = await prisma.design.findUnique({
            where: { id: designId },
            select: { id: true, deletedAt: true },
        });

        if (!design || design.deletedAt) {
            return NextResponse.json(
                { error: 'Design not found or deleted' },
                { status: 404 }
            );
        }

        const sharedByUser = await prisma.user.findUnique({
            where: { id: sharedById },
            select: { id: true, deletedAt: true },
        });

        if (!sharedByUser || sharedByUser.deletedAt) {
            return NextResponse.json(
                { error: 'Sharing user not found or deleted' },
                { status: 404 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        let sharedWithUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, deletedAt: true },
        });

        if (!sharedWithUser) {
            sharedWithUser = await prisma.user.create({
                data: { email: normalizedEmail },
                select: { id: true, deletedAt: true },
            });
        } else if (sharedWithUser.deletedAt) {
            return NextResponse.json(
                { error: 'User with that email has been deleted' },
                { status: 404 }
            );
        }

        const permission = roleToPermission(role);

        const record = await prisma.sharedDesign.upsert({
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

        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        console.error(`POST /api/designs/${designId}/shares failed:`, error);
        return NextResponse.json(
            { error: 'Failed to create share' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/designs/[id]/shares
 */
export async function PATCH(req: Request, context: RouteContext) {
    const { id: designId } = await context.params;

    if (!designId) {
        return NextResponse.json({ error: 'Missing design id' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { shareId, role }: { shareId?: string; role?: RoleString } = body || {};

        if (!shareId || !role) {
            return NextResponse.json(
                { error: 'shareId and role are required' },
                { status: 400 }
            );
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
        console.error(`PATCH /api/designs/${designId}/shares failed:`, error);
        return NextResponse.json(
            { error: 'Failed to update permission' },
            { status: 500 }
        );
    }
}
