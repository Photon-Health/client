import { types } from '@photonhealth/sdk';

export interface DiscountCard {
  id: string;
  price: number;
  bin: string;
  pcn: string;
  group: string;
  memberId: string;
}

export interface Order extends types.Order {
  organization: {
    id: string;
    name: string;
  };
  readyBy?: string;
  readyByDay?: string;
  readyByTime?: string;
  isReroutable?: boolean;
  pharmacyEstimatedReadyAt?: Date;
  discountCard?: DiscountCard | null;
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
  medicationPrice?: number;
}

export type ExtendedFulfillmentType = types.FulfillmentType | 'COURIER';
