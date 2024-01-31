import { Fill } from '@photonhealth/sdk/dist/types';

export default function uniqueFills(order: { fills: any[] }): Partial<Fill>[] {
  const treatmentNames = new Set<string>();

  return order.fills.filter((fill) => {
    const treatmentName = fill.treatment?.name;
    if (!treatmentName || treatmentNames.has(treatmentName)) {
      return false;
    }

    treatmentNames.add(treatmentName);
    return true;
  });
}
