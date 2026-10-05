import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domains = await prisma.officialDomain.findMany({
      orderBy: [{ trustStatus: "asc" }, { domain: "asc" }],
    });

    return NextResponse.json({ domains });
  } catch (error: any) {
    console.error("Error fetching official domains:", error);
    return NextResponse.json(
      { error: "Failed to fetch official domains" },
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
    const {
      organizationName,
      orgName,
      orgShortName,
      domain,
      allowedSubdomains,
      sourceType = "GOV_NIC",
      trustStatus = "VERIFIED_GOV",
      notes,
    } = body;

    const resolvedOrgName = orgName || organizationName;
    if (!resolvedOrgName || !domain) {
      return NextResponse.json(
        { error: "Organization name and domain are required" },
        { status: 400 }
      );
    }

    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").split("/")[0];

    const existing = await prisma.officialDomain.findUnique({
      where: { domain: cleanDomain },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Domain '${cleanDomain}' already exists in registry` },
        { status: 409 }
      );
    }

    const subString = Array.isArray(allowedSubdomains)
      ? allowedSubdomains.join(", ")
      : allowedSubdomains || "*";

    const newDomain = await prisma.officialDomain.create({
      data: {
        orgName: resolvedOrgName,
        orgShortName: orgShortName || resolvedOrgName.substring(0, 10),
        domain: cleanDomain,
        allowedSubdomains: subString,
        sourceType,
        trustStatus,
        notes,
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "REGISTER_OFFICIAL_DOMAIN",
      entityType: "OfficialDomain",
      entityId: newDomain.id,
      entityTitle: cleanDomain,
      newValue: newDomain,
      reason: `Registered official government domain: ${cleanDomain} for ${resolvedOrgName}`,
    });

    return NextResponse.json({ domain: newDomain });
  } catch (error: any) {
    console.error("Error registering official domain:", error);
    return NextResponse.json(
      { error: "Failed to register official domain" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, trustStatus, allowedSubdomains, notes, justification } = body;

    if (!id) {
      return NextResponse.json({ error: "Domain ID is required" }, { status: 400 });
    }

    const previous = await prisma.officialDomain.findUnique({ where: { id } });
    if (!previous) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const subString = Array.isArray(allowedSubdomains)
      ? allowedSubdomains.join(", ")
      : allowedSubdomains !== undefined
      ? allowedSubdomains
      : previous.allowedSubdomains;

    const updated = await prisma.officialDomain.update({
      where: { id },
      data: {
        trustStatus: trustStatus || previous.trustStatus,
        allowedSubdomains: subString,
        notes: notes !== undefined ? notes : previous.notes,
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "UPDATE_OFFICIAL_DOMAIN",
      entityType: "OfficialDomain",
      entityId: id,
      entityTitle: previous.domain,
      previousValue: previous,
      newValue: updated,
      reason: justification || "Updated official domain trust rules",
    });

    return NextResponse.json({ domain: updated });
  } catch (error: any) {
    console.error("Error updating official domain:", error);
    return NextResponse.json(
      { error: "Failed to update official domain" },
      { status: 500 }
    );
  }
}
