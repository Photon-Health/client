import {
  GetPharmaciesByLocationQuery,
  GetOrderQuery,
  Address as GQLAddress,
  FulfillmentType,
  Maybe,
  OfferPromotion
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

export interface OfferDetails {
  deliveryEstimate?: string;
  costType?: string;
  costAmount?: number;
  costAmountTitle?: string;
  retailAmount?: number;
  retailAmountTitle?: string;
  pharmacy: {
    id: string;
    name: string;
    fulfillmentTypes: FulfillmentType[];
    logo?: string;
  };
  tags: string[];
}

export interface OfferBundleDetails extends OfferDetails {
  medications: Array<{
    name?: string;
    amount: number;
    amountTitle?: string;
    retailAmount?: number;
    retailAmountTitle?: string;
    promotions?: Array<OfferPromotion>;
  }>;
}

export const OfferTypes = {
  RxSense: 'RxSense',
  GoodRx: 'GoodRx',
  AmazonPharmacy: 'Amazon Pharmacy'
} as const;

export type OfferTypeKey = keyof typeof OfferTypes;
export type OfferType = (typeof OfferTypes)[keyof typeof OfferTypes];

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
export type Promotion = OfferPromotion;
export const OfferPromotionTypes = {
  AmazonPharmacyRXCoupon: 'PHARMACY_RX_COUPON'
} as const;
