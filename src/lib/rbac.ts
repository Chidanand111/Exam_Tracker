/**
 * Role-Based Access Control (RBAC) System (Requirement 78)
 *
 * Replaces monolithic admin access with fine-grained role hierarchy:
 * - Super Admin: Unrestricted platform governance
 * - Source Manager: Official portal crawlers and domain registry
 * - Recruitment Editor: Recruitment notices, cycles, stages, and corrigendums
 * - Data Reviewer: Granular human review queue and field validation
 * - Support Agent: User query resolution and broken link reviews
 * - Analytics Viewer: Read-only access to product metrics and audit trails
 */

export type AdminRole =
  | "SUPER_ADMIN"
  | "SOURCE_MANAGER"
  | "RECRUITMENT_EDITOR"
  | "DATA_REVIEWER"
  | "SUPPORT_AGENT"
  | "ANALYTICS_VIEWER"
  | "ADMIN" // Legacy alias mapping to SUPER_ADMIN
  | "USER";

export type Permission =
  | "MANAGE_SOURCES"
  | "TRIGGER_CRAWLER"
  | "MANAGE_DOMAINS"
  | "EDIT_RECRUITMENTS"
  | "PUBLISH_CORRIGENDUM"
  | "REVIEW_FIELDS"
  | "RESOLVE_CONFLICTS"
  | "VIEW_AUDIT_LOGS"
  | "VIEW_ANALYTICS"
  | "MANAGE_USERS"
  | "RESOLVE_DUPLICATES";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    "MANAGE_SOURCES",
    "TRIGGER_CRAWLER",
    "MANAGE_DOMAINS",
    "EDIT_RECRUITMENTS",
    "PUBLISH_CORRIGENDUM",
    "REVIEW_FIELDS",
    "RESOLVE_CONFLICTS",
    "VIEW_AUDIT_LOGS",
    "VIEW_ANALYTICS",
    "MANAGE_USERS",
    "RESOLVE_DUPLICATES",
  ],
  // Legacy "ADMIN" has super admin privileges
  ADMIN: [
    "MANAGE_SOURCES",
    "TRIGGER_CRAWLER",
    "MANAGE_DOMAINS",
    "EDIT_RECRUITMENTS",
    "PUBLISH_CORRIGENDUM",
    "REVIEW_FIELDS",
    "RESOLVE_CONFLICTS",
    "VIEW_AUDIT_LOGS",
    "VIEW_ANALYTICS",
    "MANAGE_USERS",
    "RESOLVE_DUPLICATES",
  ],
  SOURCE_MANAGER: [
    "MANAGE_SOURCES",
    "TRIGGER_CRAWLER",
    "MANAGE_DOMAINS",
    "VIEW_AUDIT_LOGS",
  ],
  RECRUITMENT_EDITOR: [
    "EDIT_RECRUITMENTS",
    "PUBLISH_CORRIGENDUM",
    "RESOLVE_DUPLICATES",
    "RESOLVE_CONFLICTS",
  ],
  DATA_REVIEWER: [
    "REVIEW_FIELDS",
    "RESOLVE_CONFLICTS",
    "RESOLVE_DUPLICATES",
  ],
  SUPPORT_AGENT: [
    "REVIEW_FIELDS",
    "VIEW_ANALYTICS",
  ],
  ANALYTICS_VIEWER: [
    "VIEW_ANALYTICS",
    "VIEW_AUDIT_LOGS",
  ],
  USER: [],
};

/**
 * Checks if a given role possesses the required permission.
 */
export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role.toUpperCase()] || [];
  return permissions.includes(permission);
}

/**
 * Returns human-readable label for a role
 */
export function getRoleBadge(role: string): { label: string; badgeClass: string } {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return { label: "Super Admin", badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
    case "SOURCE_MANAGER":
      return { label: "Source Manager", badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
    case "RECRUITMENT_EDITOR":
      return { label: "Recruitment Editor", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
    case "DATA_REVIEWER":
      return { label: "Data Reviewer", badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" };
    case "SUPPORT_AGENT":
      return { label: "Support Agent", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    case "ANALYTICS_VIEWER":
      return { label: "Analytics Viewer", badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30" };
    default:
      return { label: "Candidate", badgeClass: "bg-slate-800 text-slate-400 border-slate-700" };
  }
}
