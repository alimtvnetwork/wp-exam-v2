/**
 * Calendar Reminder Integration for Candidate Technical Assessments.
 * Provides 1-click Google Calendar scheduling and universal .ics (iCal) exports.
 */

export interface CalendarEventParams {
  title: string;
  description: string;
  locationUrl: string;
  startDate: Date;
  durationMinutes: number;
}

/**
 * Formats a Date object into UTC YYYYMMDDTHHmmssZ format required by Google Calendar and iCal.
 */
export function formatUtcDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Builds a direct 1-click Google Calendar event creation URL.
 */
export function buildGoogleCalendarUrl(params: CalendarEventParams): string {
  const startTime = formatUtcDateTime(params.startDate);
  const endDate = new Date(params.startDate.getTime() + params.durationMinutes * 60 * 1000);
  const endTime = formatUtcDateTime(endDate);

  const queryParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${startTime}/${endTime}`,
    details: `${params.description}\n\nDirect Portal Access Link:\n${params.locationUrl}`,
    location: params.locationUrl,
  });

  return `https://calendar.google.com/calendar/render?${queryParams.toString()}`;
}

/**
 * Generates valid iCalendar (.ics) content for Apple Calendar, Outlook, and mobile calendar apps.
 */
export function generateIcsContent(params: CalendarEventParams): string {
  const dtStamp = formatUtcDateTime(new Date());
  const dtStart = formatUtcDateTime(params.startDate);
  const dtEnd = formatUtcDateTime(new Date(params.startDate.getTime() + params.durationMinutes * 60 * 1000));
  const cleanSummary = params.title.replace(/[\r\n]+/g, ' ');
  const cleanDescription = `${params.description}\n\nDirect Portal Access Link:\n${params.locationUrl}`
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WP Exam//Candidate Assessment Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wp-exam-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@candidate-portal`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${params.locationUrl}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Technical Assessment starting in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers a browser download of an .ics calendar reminder file.
 */
export function downloadIcsFile(params: CalendarEventParams, filename = 'assessment-reminder.ics'): void {
  if (typeof window === 'undefined') {
    return;
  }

  const icsText = generateIcsContent(params);
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const tempLink = document.createElement('a');

  tempLink.href = downloadUrl;
  tempLink.setAttribute('download', filename);
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  URL.revokeObjectURL(downloadUrl);
}
