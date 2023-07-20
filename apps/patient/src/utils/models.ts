import { types } from '@photonhealth/react';

export interface Order extends types.Order {
  organization: {
    id: string;
    name: string;
  };
}

export interface Pharmacy extends types.Pharmacy {
  id: string;
  address?: types.Address;
  name: string;
  info?: string | undefined;
  distance?: number | undefined;
  rating?: string | undefined;
  businessStatus?: string | undefined;
  hours?: {
    open?: boolean;
    is24Hr?: boolean;
    opens?: string;
    opensDay?: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    closes?: string;
  };
  enriched?: boolean | undefined;
}

export type ExtendedFulfillmentType = types.FulfillmentType | 'COURIER';
