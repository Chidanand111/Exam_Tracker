import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, demoRole } = body;

    let user: any = null;

    if (demoRole) {
      const demoEmail = demoRole === "admin" ? "admin@bharatexam.in" : "aspirant@bharatexam.in";
      try {
        user = await prisma.user.findUnique({
          where: { email: demoEmail },
        });
      } catch (dbErr: any) {
        console.warn("Database fallback for demo role login:", dbErr?.message);
      }

      if (!user) {
        if (demoRole === "admin") {
          user = {
            id: "cmuk0gaa00001jywo8iu4kzo5",
            name: "Government Exam Portal Officer",
            email: "admin@bharatexam.in",
            role: "ADMIN",
          };
        } else {
          user = {
            id: "cmuk0g9o40000jywo5ff02197",
            name: "Chidananda Sharma",
            email: "aspirant@bharatexam.in",
            role: "USER",
          };
        }
      }
    } else {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      try {
        user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });
      } catch (dbErr: any) {
        console.warn("Database connection issue during login:", dbErr?.message);
        throw dbErr;
      }

      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Verify password if user has passwordHash (from DB)
      if (user.passwordHash) {
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
      }
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "USER" | "ADMIN",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
