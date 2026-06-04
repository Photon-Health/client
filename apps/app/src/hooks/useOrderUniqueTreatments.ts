import { useMemo } from 'react';
import { Order, Treatment } from '@photonhealth/sdk/dist/types';

export function useOrderUniqueTreatments(order: Order) {
  return useMemo(() => {
    const medicationLookup = order.fills.reduce<Record<string, Treatment>>((acc, cur) => {
      if (!acc[cur.treatment.id]) {
        acc[cur.treatment.id] = cur.treatment;
      }

      return acc;
    }, {});

    return Object.values(medicationLookup);
  }, [order]);
}
