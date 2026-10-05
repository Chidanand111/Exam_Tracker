/**
 * Calendar Integration Utility (Requirement 65)
 *
 * Generates RFC 5545 compliant iCalendar (.ics) files and Google Calendar template links
 * for personal exam dates, reporting times, application deadlines, and interviews.
 */

export interface CalendarEventParams {
  uid?: string;
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  url?: string;
  organizerName?: string;
  alarmMinutesBefore?: number;
}

/**
 * Format a Date to iCalendar UTC format (e.g., 20261114T090000Z)
 */
function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Escapes characters per RFC 5545
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generates RFC 5545 standard .ics file string
 */
export function generateIcsContent(event: CalendarEventParams): string {
  const uid = event.uid || `bharatexam-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@bharatexam.org`;
  const dtStamp = formatIcsDate(new Date());
  const dtStart = formatIcsDate(event.startDate);
  // Default end time to 2 hours after start if not provided
  const dtEnd = formatIcsDate(event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000));

  const alarmMinutes = event.alarmMinutesBefore || 120; // 2 hours before by default

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BharatExam Tracker//Government Exam Discovery//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
  ];

  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  if (event.url) {
    lines.push(`URL:${escapeIcsText(event.url)}`);
  }

  // Reminder Alarm
  lines.push(
    "BEGIN:VALARM",
    `TRIGGER:-PT${alarmMinutes}M`,
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${escapeIcsText(event.title)}`,
    "END:VALARM"
  );

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Generates Google Calendar web link for one-click addition
 */
export function generateGoogleCalendarUrl(event: CalendarEventParams): string {
  const dtStart = formatIcsDate(event.startDate);
  const dtEnd = formatIcsDate(event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000));

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${dtStart}/${dtEnd}`,
    details: `${event.description}${event.url ? `\n\nOfficial Portal: ${event.url}` : ""}\n\nTracked via BharatExam Tracker`,
  });

  if (event.location) {
    params.set("location", event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
