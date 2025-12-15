import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/users
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const limit = Math.min(
            parseInt(searchParams.get('limit') || '20', 10),
            100
        ); // default 20, max 100
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const users = await prisma.user.findMany({
            where: { deletedAt: null }, // filter soft-deleted users
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('GET /api/users failed:', error);
        return NextResponse.json(
            { error: 'Failed to list users' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/users
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body?.email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.create({
            data: {
                email: body.email,
                name: body.name ?? null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('POST /api/users failed:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
