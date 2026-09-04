import { ApiError } from "./auth";

export function errorResponse(status: number, code: string): Response {
  return Response.json({ error: code }, { status });
}

// Uniform error handling for route handlers: ApiError becomes its status
// code, anything unexpected becomes a content-free 500.
export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) return errorResponse(error.status, error.code);
  console.error("[api] unexpected error", error);
  return errorResponse(500, "SERVER_ERROR");
}
