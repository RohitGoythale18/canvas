import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthUser } from '@/types';

export function authenticateRequest(request: NextRequest): AuthRequest {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        ) as AuthUser;

        (request as AuthRequest).user = decoded;
        return request as AuthRequest;
    } catch {
        throw new Error('Invalid or expired token');
    }
}
