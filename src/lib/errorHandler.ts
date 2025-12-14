// src/lib/errorHandler.ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

/**
 * Prisma error codes
 * Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
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
 * Extracts field name from Prisma unique constraint error
 */
function getUniqueConstraintField(error: Prisma.PrismaClientKnownRequestError): string | null {
  if (error.meta && typeof error.meta === 'object' && 'target' in error.meta) {
    const target = error.meta.target;
    if (Array.isArray(target) && target.length > 0) {
      return target[0] as string;
    }
  }
  return null;
}

/**
 * Handles Prisma-specific errors and returns appropriate HTTP responses
 */
export function handlePrismaError(error: unknown, context: string): ErrorResponse {
  // Log the error for debugging
  console.error(`[${context}] Error:`, error);

  // Check if it's a Prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT: {
        const field = getUniqueConstraintField(error);
        const fieldName = field ? field.replace(/([A-Z])/g, ' $1').toLowerCase() : 'field';
        return {
          error: `A record with this ${fieldName} already exists`,
          status: 409, // Conflict
          details: `Unique constraint violation on ${field || 'unknown field'}`,
        };
      }

      case PRISMA_ERROR_CODES.RECORD_NOT_FOUND:
        return {
          error: 'Record not found',
          status: 404,
          details: error.meta?.cause as string | undefined,
        };

      case PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT:
        return {
          error: 'Invalid reference: related record does not exist',
          status: 400,
          details: error.meta?.field_name as string | undefined,
        };

      case PRISMA_ERROR_CODES.REQUIRED_VALUE_MISSING:
        return {
          error: 'Required field is missing',
          status: 400,
          details: error.meta?.path as string | undefined,
        };

      case PRISMA_ERROR_CODES.VALUE_OUT_OF_RANGE:
        return {
          error: 'Invalid value provided',
          status: 400,
          details: error.message,
        };

      default:
        return {
          error: 'Database operation failed',
          status: 500,
          details: error.message,
        };
    }
  }

  // Check if it's a Prisma validation error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      error: 'Invalid data provided',
      status: 400,
      details: error.message,
    };
  }

  // Check if it's a JSON parsing error
  if (error instanceof SyntaxError) {
    return {
      error: 'Invalid JSON in request body',
      status: 400,
      details: error.message,
    };
  }

  // Generic error handling
  if (error instanceof Error) {
    return {
      error: 'An error occurred',
      status: 500,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
  }

  // Unknown error type
  return {
    error: 'An unexpected error occurred',
    status: 500,
  };
}

/**
 * Wraps an API handler with consistent error handling
 * Usage:
 *   export async function GET() {
 *     return handleApiError(async () => {
 *       const data = await prisma.user.findMany();
 *       return NextResponse.json(data);
 *     }, 'GET /api/users');
 *   }
 */
export async function handleApiError<T>(
  handler: () => Promise<NextResponse<T>>,
  context: string
): Promise<NextResponse<ErrorResponseBody | T>> {
  try {
    return await handler();
  } catch (error) {
    const errorResponse = handlePrismaError(error, context);
    return NextResponse.json(
      {
        error: errorResponse.error,
        ...(errorResponse.details && { details: errorResponse.details }),
      },
      { status: errorResponse.status }
    );
  }
}

/**
 * Helper to create error responses directly
 */
export function createErrorResponse(
  error: unknown,
  context: string,
  defaultMessage?: string
): NextResponse<ErrorResponseBody> {
  const errorResponse = handlePrismaError(error, context);
  return NextResponse.json(
    {
      error: defaultMessage || errorResponse.error,
      ...(errorResponse.details && { details: errorResponse.details }),
    },
    { status: errorResponse.status }
  );
}

