// src/app/api/users/dummy/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const DUMMY_EMAIL = 'user@gmail.com';
const DUMMY_NAME = 'User1';

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * GET /api/users/dummy
 */
export async function GET() {
  if (isProduction()) {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    );
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: DUMMY_EMAIL },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: DUMMY_EMAIL,
          name: DUMMY_NAME,
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('GET /api/users/dummy failed:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dummy user' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/dummy
 */
export async function POST() {
  if (isProduction()) {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    );
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: DUMMY_EMAIL },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: DUMMY_EMAIL,
          name: DUMMY_NAME,
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('POST /api/users/dummy failed:', error);
    return NextResponse.json(
      { error: 'Failed to create/retrieve dummy user' },
      { status: 500 }
    );
  }
}
