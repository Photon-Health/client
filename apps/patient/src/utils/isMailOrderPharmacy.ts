/**
 * Checks if a pharmacy ID corresponds to a mail order pharmacy
 * Currently only Amazon Pharmacy and NovoCare are considered mail order
 */
export function isMailOrderPharmacy(pharmacyId: string): boolean {
  return (
    pharmacyId === process.env.REACT_APP_AMAZON_PHARMACY_ID ||
    pharmacyId === process.env.REACT_APP_NOVOCARE_PHARMACY_ID
  );
}
