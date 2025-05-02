import {
  GetPharmaciesByLocationQuery,
  GetOrderQuery,
  Address as GQLAddress,
  FulfillmentType,
  Maybe
} from '../__generated__/graphql';

type NotMaybe<T> = Exclude<T, null | undefined>;
export type Order = NotMaybe<GetOrderQuery['order']>;
export type Fill = Order['fills'][number];

export type Fulfillment = Order['fulfillments'][number];
export type Exception = Fulfillment['exceptions'][number];
export type PrescriptionFulfillmentState = Fulfillment['state'];

export type Pharmacy = NotMaybe<GetPharmaciesByLocationQuery['pharmaciesByLocation'][number]> & {
  price?: Maybe<number>;
};

export type OrderFulfillment = NotMaybe<Order['fulfillment']>;

export type EnrichedPharmacy = Pharmacy & {
  logo?: string | null;
  showReadyIn30Min?: boolean;
  is24Hr?: boolean;
  isClosingSoon?: boolean;
  opens?: string | undefined;
  closes?: string | undefined;
  price?: number;
  retailPrice?: number;
};
export type ExtendedFulfillmentType = FulfillmentType | 'COURIER';

export type Address = GQLAddress;
