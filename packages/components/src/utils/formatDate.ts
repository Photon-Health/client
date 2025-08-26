export default function formatDate(dateString: string): string {
  if (!dateString) {
    return '';
  }

  return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'UTC' });
}
