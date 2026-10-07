import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { UserSession } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "bharat-exam-tracker-dev-key-local-only-super-safe";
export const AUTH_COOKIE_NAME = "bharat_exam_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Strict role enforcement helper. Throws specific errors if not authenticated or not an admin.
 */
export async function requireAdmin(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    const error: any = new Error("Authentication required");
    error.status = 401;
    throw error;
  }
  if (user.role !== "ADMIN") {
    const error: any = new Error("Access denied: Administrator privileges required");
    error.status = 403;
    throw error;
  }
  return user;
}

export function isAdmin(user: UserSession | null): boolean {
  return !!user && user.role === "ADMIN";
}
