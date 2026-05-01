/**
 * Format date to client's local date string (MM/DD/YYYY)
 */
export function formatDate(date?: string) {
  return date ? new Date(date)?.toLocaleDateString('en-US') : '';
}

/**
 * Format date to a UTC date string (MM/DD/YYYY)
 * Use for any dates that should NOT be shifted to the
 * client's local timezone
 */
export function formatDateUTC(date?: string) {
  return date ? new Date(date)?.toLocaleDateString('en-US', { timeZone: 'UTC' }) : '';
}

export const CALENDAR_DATE_FORMAT = 'yyyy-MM-dd';
