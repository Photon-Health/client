export default function formatDate(dateString: string): string {
  if (!dateString) {
    return '';
  }

  return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'UTC' });
}

export const CALENDAR_DATE_FORMAT = 'yyyy-MM-dd';
