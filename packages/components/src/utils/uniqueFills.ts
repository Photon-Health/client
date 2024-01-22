import { Fill, Order } from '@photonhealth/sdk/dist/types';

export default function uniqueFills(order: Order): Fill[] {
  const treatmentNames = new Set<string>();

  return order.fills.filter((fill) => {
    if (treatmentNames.has(fill.treatment.name)) {
      return false;
    }

    treatmentNames.add(fill.treatment.name);
    return true;
  });
}
