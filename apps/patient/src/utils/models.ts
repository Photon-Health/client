import { types } from '@photonhealth/sdk';

export interface Order extends types.Order {
  organization: {
    id: string;
    name: string;
  };
  readyBy?: string;
  readyByDay?: string;
  readyByTime?: string;
  isReroutable?: boolean;
}

export interface Pharmacy extends types.Pharmacy {
  id: string;
  address?: types.Address | null;
  name: string;
  info?: string | undefined;
  distance?: number | undefined;
  isOpen?: boolean;
  is24Hr?: boolean;
  isClosingSoon?: boolean;
  showReadyIn30Min?: boolean;
  closes?: string;
  opens?: string;
  logo?: string | null;
}

export type ExtendedFulfillmentType = types.FulfillmentType | 'COURIER';
