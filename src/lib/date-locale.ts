/**
 * Time-Zone & Locale Formatting Utility (Requirement 66)
 *
 * Ensures consistent Indian Standard Time (IST - Asia/Kolkata) formatting
 * across all official government exam notices, application deadlines, and exam shifts.
 * Prevents ambiguous formats such as 10/11/2026 in favor of unambiguous "10 November 2026".
 */

export const IST_TIMEZONE = "Asia/Kolkata";
export const INDIAN_LOCALE = "en-IN";

/**
 * Formats a Date object or ISO string into unambiguous Indian standard date.
 * Example output: "10 November 2026"
 */
export function formatDateIndian(
  dateInput: Date | string | null | undefined,
  fallback = "Not announced"
): string {
  if (!dateInput) return fallback;
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return fallback;

  return new Intl.DateTimeFormat(INDIAN_LOCALE, {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a Date object or ISO string into date and time with explicit IST indicator.
 * Example output: "10 November 2026, 02:30 PM IST"
 */
export function formatDateTimeIST(
  dateInput: Date | string | null | undefined,
  fallback = "Not announced"
): string {
  if (!dateInput) return fallback;
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return fallback;

  const dateStr = new Intl.DateTimeFormat(INDIAN_LOCALE, {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return `${dateStr} IST`;
}

/**
 * Formats time only in 12-hour format with IST indicator.
 * Example output: "09:30 AM IST"
 */
export function formatTimeIST(
  dateInput: Date | string | null | undefined,
  fallback = "N/A"
): string {
  if (!dateInput) return fallback;
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return fallback;

  const timeStr = new Intl.DateTimeFormat(INDIAN_LOCALE, {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return `${timeStr} IST`;
}

/**
 * Relative time description relative to current Indian Standard Time.
 * Example output: "Closing in 3 days", "Exam tomorrow", "Closed 5 days ago"
 */
export function formatRelativeIST(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "Date not specified";
  const target = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(target.getTime())) return "Invalid date";

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffMs > 0) {
    if (diffDays === 0) {
      if (diffHours <= 1) return "Closing in under an hour";
      return `Closing today (${diffHours}h left)`;
    }
    if (diffDays === 1) return "Closing tomorrow";
    if (diffDays <= 30) return `Closing in ${diffDays} days`;
    return `Active until ${formatDateIndian(target)}`;
  } else {
    const pastDays = Math.abs(diffDays);
    if (pastDays === 0) return "Closed today";
    if (pastDays === 1) return "Closed yesterday";
    return `Closed ${pastDays} days ago`;
  }
}
