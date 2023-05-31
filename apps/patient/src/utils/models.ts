import { types } from 'packages/sdk';

export interface Order extends types.Order {
  organization: {
    id: string;
    name: string;
  };
}

export interface Pharmacy {
  id: string;
  address: types.Address;
  name: string;
  info: string;
  distance: number;
  rating?: string;
  businessStatus: string;
  hours?: {
    open?: boolean;
    is24Hr?: boolean;
    opens?: string;
    opensDay?: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    closes?: string;
  };
}

export type FulfillmentType = 'mailOrder' | 'courier' | 'pickup';
