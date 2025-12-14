import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

/**
 * Prisma error codes
 */
const PRISMA_ERROR_CODES = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
  FOREIGN_KEY_CONSTRAINT: 'P2003',
  REQUIRED_VALUE_MISSING: 'P2012',
  VALUE_OUT_OF_RANGE: 'P2014',
} as const;

interface ErrorResponseBody {
  error: string;
  details?: string;
}

interface ErrorResponse {
  error: string;
  status: number;
  details?: string;
}

/**
 * Extract unique constraint field
 */
function getUniqueConstraintField(
  error: Prisma.PrismaClientKnownRequestError
): string | null {
  if (error.meta && typeof error.meta === 'object') {
    const meta = error.meta as { target?: unknown };
    if (Array.isArray(meta.target) && meta.target.length > 0) {
      return meta.target[0] as string;
    }
  }
  return null;
}

/**
 * Central error handler
 */
export function handlePrismaError(
  error: unknown,
  context: string
): ErrorResponse {
  console.error(`[${context}]`, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT: {
        const field = getUniqueConstraintField(error);
        return {
          error: `A record with this ${field ?? 'field'} already exists`,
          status: 409,
        };
      }

      case PRISMA_ERROR_CODES.RECORD_NOT_FOUND:
        return { error: 'Record not found', status: 404 };

      case PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT:
        return {
          error: 'Invalid reference',
          status: 400,
        };

      default:
        return {
          error: 'Database error',
          status: 500,
          details: error.message,
        };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      error: 'Invalid data provided',
      status: 400,
      details: error.message,
    };
  }

  if (error instanceof SyntaxError) {
    return {
      error: 'Invalid JSON body',
      status: 400,
    };
  }

  if (error instanceof Error) {
    return {
      error: 'Internal server error',
      status: 500,
      details:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    };
  }

  return {
    error: 'Unexpected error',
    status: 500,
  };
}

/**
 * API error wrapper
 */
export async function handleApiError<T>(
  handler: () => Promise<NextResponse<T>>,
  context: string
): Promise<NextResponse<ErrorResponseBody | T>> {
  try {
    return await handler();
  } catch (error: unknown) {
    const res = handlePrismaError(error, context);
    return NextResponse.json(
      { error: res.error, ...(res.details && { details: res.details }) },
      { status: res.status }
    );
  }
}

/**
 * Helper for catch blocks
 */
export function createErrorResponse(
  error: unknown,
  context: string,
  defaultMessage?: string
): NextResponse<ErrorResponseBody> {
  const res = handlePrismaError(error, context);
  return NextResponse.json(
    {
      error: defaultMessage ?? res.error,
      ...(res.details && { details: res.details }),
    },
    { status: res.status }
  );
}
