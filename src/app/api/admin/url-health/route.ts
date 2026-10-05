import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { verifyOfficialDomain } from "@/lib/domain-verifier";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const checks = await prisma.urlHealthCheck.findMany({
      include: {
        recruitment: {
          select: {
            id: true,
            title: true,
            slug: true,
            organization: { select: { shortName: true } },
          },
        },
      },
      orderBy: { lastCheckedAt: "desc" },
      take: 100,
    });

    const total = checks.length;
    const healthy = checks.filter((c) => c.status === "HEALTHY" || (c.statusCode && c.statusCode < 400)).length;
    const broken = checks.filter((c) => c.status.startsWith("BROKEN") || (c.statusCode && c.statusCode >= 400)).length;
    const redirects = checks.filter((c) => c.status === "WARNING_REDIRECT" || Boolean(c.redirectDestination)).length;

    return NextResponse.json({
      checks,
      stats: {
        total,
        healthy,
        broken,
        redirects,
      },
    });
  } catch (error: any) {
    console.error("Error fetching URL health checks:", error);
    return NextResponse.json(
      { error: "Failed to fetch URL health checks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { recruitmentId, url, urlType = "APPLY_PORTAL" } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const startTime = Date.now();
    let statusCode: number | null = null;
    let isReachable = false;
    let isRedirect = false;
    let redirectDestination: string | null = null;
    let isPdfAccessible = false;
    let errorMessage: string | null = null;

    try {
      // Perform HTTP check with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BharatExam HealthMonitor/1.0",
        },
      });

      clearTimeout(timeoutId);
      statusCode = res.status;
      isReachable = res.status < 500;

      if ([301, 302, 307, 308].includes(res.status)) {
        isRedirect = true;
        redirectDestination = res.headers.get("location");
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/pdf") || url.toLowerCase().endsWith(".pdf")) {
        isPdfAccessible = res.status === 200;
      }
    } catch (err: any) {
      isReachable = false;
      errorMessage = err.message || "Network connection timed out or failed";
    }

    const responseTimeMs = Date.now() - startTime;

    // Check if domain is in official registry
    const domainCheck = await verifyOfficialDomain(redirectDestination || url);

    let status = "HEALTHY";
    if (!isReachable || (statusCode && statusCode >= 400)) {
      status = statusCode === 404 ? "BROKEN_404" : "TIMEOUT";
    } else if (isRedirect) {
      status = "WARNING_REDIRECT";
    }

    const checkRecord = await prisma.urlHealthCheck.create({
      data: {
        recruitmentId: recruitmentId || null,
        url,
        urlType,
        statusCode,
        status,
        responseTimeMs,
        isPdfAccessible,
        redirectDestination,
        errorMessage: !domainCheck.isVerified
          ? `${errorMessage ? errorMessage + " | " : ""}${domainCheck.warning || "Unverified Domain"}`
          : errorMessage,
      },
    });

    // If broken (4xx, 5xx, or network failure), create a Human Review Queue item
    if (!isReachable || (statusCode && statusCode >= 400)) {
      if (recruitmentId) {
        await prisma.reviewQueueItem.create({
          data: {
            recruitmentId,
            itemType: "BROKEN_OFFICIAL_URL",
            fieldName: urlType,
            severity: "HIGH",
            currentValue: url,
            proposedValue: null,
            description: `URL health check detected failure: HTTP ${statusCode || "N/A"} (${errorMessage || "Unreachable"}). Verification and update required.`,
            status: "PENDING_REVIEW",
          },
        });
      }
    }

    return NextResponse.json({
      check: checkRecord,
      domainCheck,
    });
  } catch (error: any) {
    console.error("Error executing URL health check:", error);
    return NextResponse.json(
      { error: "Failed to execute URL health check" },
      { status: 500 }
    );
  }
}
