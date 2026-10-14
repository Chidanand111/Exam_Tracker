import { NextRequest, NextResponse } from "next/server";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied: Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Non-operational or unexpected runtime error: Log securely on server, sanitize response
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[API_UNCAUGHT_EXCEPTION] ${new Date().toISOString()}:`, {
    message: errorMessage,
    stack: errorStack,
  });

  return NextResponse.json(
    {
      success: false,
      error: "An unexpected error occurred while processing your request.",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  );
}

export type RouteHandler<T = any> = (
  req: NextRequest,
  context?: T
) => Promise<NextResponse> | NextResponse;

/**
 * Higher-order wrapper for Next.js App Router route handlers.
 * Guarantees consistent error handling, status codes, and security redaction.
 */
export function withErrorHandler<T = any>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (req: NextRequest, context?: T) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
