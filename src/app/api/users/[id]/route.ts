import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]
 */
export async function GET(_req: Request, { params }: Params) {
    try {
        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                deletedAt: true,
            },
        });

        if (!user || user.deletedAt) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // remove deletedAt from response
        const { deletedAt, ...userResponse } = user;
        return NextResponse.json(userResponse, { status: 200 });
    } catch (error) {
        console.error('GET /api/users/[id] failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/users/[id]
 */
export async function PUT(req: Request, { params }: Params) {
    try {
        const { id } = await params;

        const existing = await prisma.user.findUnique({
            where: { id },
            select: { id: true, deletedAt: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (existing.deletedAt) {
            return NextResponse.json(
                { error: 'User has been deleted' },
                { status: 404 }
            );
        }

        const body = await req.json();

        const updated = await prisma.user.update({
            where: { id },
            data: {
                name: body.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error('PUT /api/users/[id] failed:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/users/[id]
 * Soft delete (sets deletedAt)
 */
export async function DELETE(_req: Request, { params }: Params) {
    try {
        const { id } = await params;

        const existing = await prisma.user.findUnique({
            where: { id },
            select: { id: true, deletedAt: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (existing.deletedAt) {
            return NextResponse.json(
                { error: 'User has already been deleted' },
                { status: 404 }
            );
        }

        await prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error('DELETE /api/users/[id] failed:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
