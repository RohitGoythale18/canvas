import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, createdAt: true, deletedAt: true }
        });
        if (!user || user.deletedAt) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        // Remove deletedAt from response
        const { deletedAt, ...userResponse } = user;
        return NextResponse.json(userResponse);
    } catch (error) {
        return createErrorResponse(error, `GET /api/users/[id]`, 'Failed to fetch user');
    }
}

export async function PUT(req: Request, { params }: Params) {
    try {
        const { id } = await params;
        
        // Check if user exists and is not deleted
        const existing = await prisma.user.findUnique({
            where: { id },
            select: { id: true, deletedAt: true }
        });

        if (!existing) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (existing.deletedAt) {
            return NextResponse.json({ error: 'User has been deleted' }, { status: 404 });
        }

        const body = await req.json();
        const updated = await prisma.user.update({
            where: { id },
            data: {
                name: body.name,
            },
            select: { id: true, email: true, name: true, updatedAt: true }
        });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return createErrorResponse(error, `PUT /api/users/[id]`, 'Failed to update user');
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        const { id } = await params;
        
        // Check if user exists and is not already deleted
        const existing = await prisma.user.findUnique({
            where: { id },
            select: { id: true, deletedAt: true }
        });

        if (!existing) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (existing.deletedAt) {
            return NextResponse.json({ error: 'User has already been deleted' }, { status: 404 });
        }

        await prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        return createErrorResponse(error, `DELETE /api/users/[id]`, 'Failed to delete user');
    }
}
