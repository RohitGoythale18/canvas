import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const token = searchParams.get('token');

    if (!imageUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(imageUrl, { headers });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
        }

        const contentType = response.headers.get('content-type');
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType || 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*', // Allow the frontend to read this
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Error fetching image' }, { status: 500 });
    }
}
