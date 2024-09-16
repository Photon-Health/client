import {
  GetPharmaciesByLocationQuery,
  OrderQuery,
  Address as GQLAddress,
  FulfillmentType
} from '../__generated__/graphql';

type NotMaybe<T> = Exclude<T, null | undefined>;
export type Order = NotMaybe<OrderQuery['order']>;
export type Fill = Order['fills'][number];

export type Pharmacy = NotMaybe<GetPharmaciesByLocationQuery['pharmaciesByLocation'][number]>;

export type OrderFulfillment = NotMaybe<Order['fulfillment']>;

export type EnrichedPharmacy = Pharmacy & {
  logo?: string | null;
  showReadyIn30Min?: boolean;
  is24Hr?: boolean;
  isClosingSoon?: boolean;
  opens?: string | undefined;
  closes?: string | undefined;
};
export type ExtendedFulfillmentType = FulfillmentType | 'COURIER';

export type Address = GQLAddress;
