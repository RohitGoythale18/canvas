import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errorHandler';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // Default 20, max 100
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const users = await prisma.user.findMany({
            where: { deletedAt: null }, // Filter soft-deleted users
            take: limit,
            skip: offset,
            select: { id: true, email: true, name: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        return createErrorResponse(error, 'GET /api/users', 'Failed to list users');
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        if (!body?.email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                email: body.email,
                name: body.name ?? null,
            },
            select: { id: true, email: true, name: true, createdAt: true }
        });
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        return createErrorResponse(error, 'POST /api/users', 'Failed to create user');
    }
}
