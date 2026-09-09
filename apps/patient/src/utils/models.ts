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

export type OfferBundle = GetOfferBundlesForOrderQuery['offerBundles'][number];
export type OfferPrescription = OfferBundle['offers'][number];
export type OfferAttributeTag = NotMaybe<OfferBundle['attributeTags']>[number];

// one presciption's price breakdown for an offer
export type OfferPrescriptionView = {
  name?: string;
  pricingType?: string;
  amount?: number;
  retailAmount?: number;
  promotions?: Array<OfferPromotion>;
};

// what the patient pays for the whole offer, with the labels to show
export interface OfferPricing {
  costAmount?: number;
  costAmountTitle?: string;
  retailAmount?: number;
  retailAmountTitle?: string;
}

// one pharmacy's offer, merged from the bundles that pharmacy returned
export interface PharmacyOffer {
  source?: string;
  isPromoted?: boolean;
  pharmacy: {
    id: string;
    name: string;
    fulfillmentTypes?: FulfillmentType[];
    logo?: string;
  };
  tags: OfferAttributeTag[];
  deliveryEstimate?: string;
  pricing: OfferPricing;
  prescriptions?: Array<OfferPrescriptionView>;
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
