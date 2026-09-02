import {
  GetPharmaciesByLocationQuery,
  GetOfferBundlesForOrderQuery,
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

export type OfferBundleResponse = GetOfferBundlesForOrderQuery['offerBundles'][number];
export type PrescriptionOffer = NotMaybe<OfferBundleResponse['offers']>[number];
export type OfferAttributeTag = NotMaybe<OfferBundleResponse['attributeTags']>[number];

export type OfferPrescriptionSummary = {
  name?: string;
  pricingType?: string;
  amount?: number;
  retailAmount?: number;
  promotions?: Array<OfferPromotion>;
};

// offer bundle fields that are computed on client based on offer bundle response
export interface OfferBundleComputed {
  deliveryEstimate?: string;
  costAmount?: number;
  costAmountTitle?: string;
  retailAmount?: number;
  retailAmountTitle?: string;
  medications?: Array<OfferPrescriptionSummary>;
}

// offer bundle shape after combining computed and server provided fields
export interface OfferBundleComplete extends OfferBundleComputed {
  source?: string;
  isPromoted?: boolean;
  pharmacy: {
    id: string;
    name: string;
    fulfillmentTypes?: FulfillmentType[];
    logo?: string;
  };
  tags: OfferAttributeTag[];
}

export const OfferTypes = {
  RxSense: 'RxSense',
  GoodRx: 'GoodRx',
  AmazonPharmacy: 'Amazon Pharmacy',
  Novocare: 'Novocare'
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
