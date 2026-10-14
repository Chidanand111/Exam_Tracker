import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  isAdmin,
} from "@/lib/auth";
import { UserSession } from "@/types";

describe("Authentication & Authorization Utilities", () => {
  it("should securely hash a password and verify matching plain-text password", async () => {
    const plainText = "CandidateSecure@123";
    const hash = await hashPassword(plainText);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(plainText);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix

    const isMatch = await verifyPassword(plainText, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword!456", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("should generate a signed JWT and decode valid claims", () => {
    const session: UserSession = {
      id: "usr_test_123",
      email: "aspirant@test.in",
      name: "Test Aspirant",
      role: "USER",
    };

    const token = signToken(session);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe("usr_test_123");
    expect(decoded?.email).toBe("aspirant@test.in");
    expect(decoded?.role).toBe("USER");
  });

  it("should reject tampered or invalid JWTs gracefully", () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature";
    const decoded = verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it("should enforce admin role authorization correctly", () => {
    const adminSession: UserSession = {
      id: "admin_1",
      email: "admin@bharatexam.in",
      name: "Admin User",
      role: "ADMIN",
    };

    const aspirantSession: UserSession = {
      id: "user_2",
      email: "user@bharatexam.in",
      name: "Standard User",
      role: "USER",
    };

    expect(isAdmin(adminSession)).toBe(true);
    expect(isAdmin(aspirantSession)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});
