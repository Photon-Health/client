import { types } from '@photonhealth/sdk';

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
  isOpen?: boolean;
  is24Hr?: boolean;
  closes?: string;
  opens?: string;
}

export type ExtendedFulfillmentType = types.FulfillmentType | 'COURIER';
