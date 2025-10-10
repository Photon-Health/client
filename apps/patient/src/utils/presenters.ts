export const computeNumRefillsForPrescription = (
  orderFills: Array<{ prescription?: { id?: string } } | null | undefined> | undefined,
  prescriptionId: string | undefined
): number => {
  if (!prescriptionId) return 0;
  const fillsForRx = orderFills?.filter((fill) => fill?.prescription?.id === prescriptionId).length;
  return Math.max(0, (fillsForRx ?? 0) - 1);
};
