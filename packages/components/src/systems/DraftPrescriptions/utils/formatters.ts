export const formatPatientWeight = (weight: number, weightUnit = 'lb') =>
  `Patient weight: ${weight} ${weightUnit}`;

/**
 * Ensure we always tack on the prefilled notes
 * even if the original object's notes or override notes are blank.
 * Blank means null, empty, or whitespace-only.
 * @returns an empty string if all provided arguments are blank
 */
export function constructRxNotes(
  original: string | null,
  override: string | null,
  prefill: string | null
): string {
  const isBlank = (note: string | null) => !note || !note.trim();
  override = !isBlank(override) ? override : null;
  original = !isBlank(original) ? original : null;
  prefill = !isBlank(prefill) ? prefill : null;

  return [override || original, prefill].filter((note) => !!note).join('\n\n');
}
