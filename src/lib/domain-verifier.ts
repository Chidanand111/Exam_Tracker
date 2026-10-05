import { prisma } from "@/lib/db";

export interface DomainCheckResult {
  isVerified: boolean;
  domain: string;
  organizationName?: string;
  sourceType?: string;
  trustStatus: "VERIFIED_GOV" | "TRUSTED_VENDOR" | "PENDING_REVIEW" | "SUSPICIOUS" | "UNVERIFIED";
  isAllowedSubdomain: boolean;
  warning?: string;
}

/**
 * Validates a target URL against the official government domain registry.
 * Prevents phishing or suspicious redirect links.
 */
export async function verifyOfficialDomain(urlStr: string): Promise<DomainCheckResult> {
  if (!urlStr) {
    return {
      isVerified: false,
      domain: "",
      trustStatus: "UNVERIFIED",
      isAllowedSubdomain: false,
      warning: "Empty URL provided",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return {
      isVerified: false,
      domain: urlStr,
      trustStatus: "SUSPICIOUS",
      isAllowedSubdomain: false,
      warning: "Invalid URL structure",
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  try {
    // Fetch all active registered domains from DB
    const registeredDomains = await prisma.officialDomain.findMany({
      where: { trustStatus: { in: ["VERIFIED_GOV", "TRUSTED_VENDOR"] } },
    });

    for (const reg of registeredDomains) {
      const regDomain = reg.domain.toLowerCase();

      // Check if hostname matches domain exactly or is a valid subdomain
      if (hostname === regDomain || hostname.endsWith(`.${regDomain}`)) {
        let isAllowedSub = false;

        if (hostname === regDomain) {
          isAllowedSub = true;
        } else {
          // Parse allowed subdomains string (e.g. "*", "*.ssc.gov.in", or "sscer, sscwr")
          const subdomainsRaw = reg.allowedSubdomains || "*";
          const subdomains = subdomainsRaw.split(",").map((s) => s.trim().toLowerCase());

          if (subdomains.includes("*") || subdomains.includes(`*.${regDomain}`)) {
            isAllowedSub = true;
          } else {
            const currentSub = hostname.replace(`.${regDomain}`, "");
            isAllowedSub = subdomains.includes(currentSub);
          }
        }

        return {
          isVerified: true,
          domain: regDomain,
          organizationName: reg.orgName,
          sourceType: reg.sourceType,
          trustStatus: reg.trustStatus as any,
          isAllowedSubdomain: isAllowedSub,
          warning: isAllowedSub
            ? undefined
            : `Subdomain '${hostname}' is not explicitly whitelisted for official portal ${regDomain}.`,
        };
      }
    }

    // Heuristic check for .gov.in or .nic.in domains that aren't yet in our registry
    const isGovIn = hostname.endsWith(".gov.in") || hostname.endsWith(".nic.in");

    return {
      isVerified: false,
      domain: hostname,
      trustStatus: isGovIn ? "PENDING_REVIEW" : "SUSPICIOUS",
      isAllowedSubdomain: false,
      warning: isGovIn
        ? `Domain '${hostname}' is a government portal (.gov.in) but is pending registry verification.`
        : `Domain '${hostname}' is not recognized as an official government recruitment portal.`,
    };
  } catch (error) {
    console.error("Error verifying official domain:", error);
    return {
      isVerified: false,
      domain: hostname,
      trustStatus: "UNVERIFIED",
      isAllowedSubdomain: false,
      warning: "Domain check encountered a verification service error.",
    };
  }
}
