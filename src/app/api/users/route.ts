import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, createdAt: true }
        });
        return NextResponse.json(users);
    } catch {
        return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await prisma.user.create({
            data: {
                email: body.email,
                name: body.name ?? null,
            },
            select: { id: true, email: true, name: true, createdAt: true }
        });
        return NextResponse.json(user, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
