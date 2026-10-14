import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  handleApiError,
} from "@/server/utils/api-handler";

describe("Centralized API Error Handler", () => {
  it("should format ValidationError with status 400 and code VALIDATION_ERROR", async () => {
    const error = new ValidationError("recruitmentId is missing");
    const response = handleApiError(error);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: "recruitmentId is missing",
      code: "VALIDATION_ERROR",
    });
  });

  it("should format UnauthorizedError with status 401 and code UNAUTHORIZED", async () => {
    const error = new UnauthorizedError();
    const response = handleApiError(error);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: "Authentication required",
      code: "UNAUTHORIZED",
    });
  });

  it("should format NotFoundError with status 404 and code NOT_FOUND", async () => {
    const error = new NotFoundError("Recruitment not found");
    const response = handleApiError(error);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: "Recruitment not found",
      code: "NOT_FOUND",
    });
  });

  it("should redact unexpected runtime exceptions and return status 500 without leaking stack traces", async () => {
    const sensitiveError = new Error("FATAL: database password leaked on host 10.0.0.1:5432");
    const response = handleApiError(sensitiveError);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("INTERNAL_SERVER_ERROR");
    // Verifies sensitive error string is NOT exposed to clients
    expect(body.error).not.toContain("password");
    expect(body.error).toBe("An unexpected error occurred while processing your request.");
    expect(body.stack).toBeUndefined();
  });
});
