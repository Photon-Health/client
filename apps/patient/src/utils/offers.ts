import _ from 'lodash';
import { OfferPriceType } from '../__generated__/graphql';
import {
  EnrichedPharmacy,
  OfferAttributeTag,
  OfferPrescriptionView,
  OfferPrescription,
  PaymentOption,
  PharmacyOffer,
  PharmacyOfferGroup,
  OfferPricing,
  OfferPromotionTypes,
  Promotion
} from './models';
import { text as t } from './text';

export const OFFER_SOURCE = {
  AMAZON_PHARMACY: 'AMAZON_PHARMACY',
  NOVOCARE: 'NOVOCARE',
  UK_HEALTH: 'UK_HEALTH',
  ARRIVE: 'ARRIVE'
} as const;

// attributeTag kind marking a paid-placement (sponsored) offer
export const SPONSORED_TAG_KIND = 'SPONSORED';

// promoted offers don't have rank (yet) so we enforce that here for now
export const CLIENT_SOURCE_PRIORITY: string[] = [
  OFFER_SOURCE.AMAZON_PHARMACY,
  OFFER_SOURCE.NOVOCARE
];

// Display titles for price types. Currently, only Amazon Pharmacy has potential to serve MEMBERSHIP offers
const PRICE_TYPE_TITLES: Record<OfferPriceType, string> = {
  MEMBERSHIP: 'Prime Member Price',
  CASH: 'Cash Price',
  INSURANCE: 'With insurance'
};
// Display title for a mix of offers that span more than one price type
const MIXED_PRICE_TITLE = 'Total Price';
const RETAIL_TITLE = 'Retail';

// We don't display Cash and Membership offers separately,
// instead we pick the best price across these two types
const BEST_PRICE_TYPES: OfferPriceType[] = ['CASH', 'MEMBERSHIP'];

// Currently only supports Amazon Pharmacy RX coupons
function isApplicable(promotion: Promotion): boolean {
  return (
    promotion.type === OfferPromotionTypes.AmazonPharmacyRXCoupon &&
    !!promotion.amount &&
    !!promotion.amountSaved
  );
}

// Currently only supports Amazon Pharmacy RX coupons
function getAmountAfterPromotions(offer: OfferPrescription): number | undefined {
  const amount = offer.prescriptionPrice?.amount;
  if (offer.priceType === 'INSURANCE') {
    return amount;
  }

  const applicable = (offer.prescriptionPrice?.promotions ?? []).filter(isApplicable);
  if (applicable.length === 0) {
    return amount;
  }

  const largest = applicable.reduce((max, promotion) =>
    (promotion.amount ?? 0) > (max.amount ?? 0) ? promotion : max
  );
  return largest.amount! - largest.amountSaved!;
}

function buildCashRetailByPrescription(offers: OfferPrescription[]): Map<string, number> {
  return offers.reduce<Map<string, number>>((cashRetail, offer) => {
    const prescriptionId = offer.prescription?.id;
    const retailAmount = offer.prescriptionPrice?.retailAmount;
    if (offer.priceType !== 'CASH' || prescriptionId == null || retailAmount == null) {
      return cashRetail;
    }
    return cashRetail.set(prescriptionId, retailAmount);
  }, new Map());
}

function toPrescriptionView(
  offer: OfferPrescription,
  cashRetailByPrescription: Map<string, number>
): OfferPrescriptionView {
  const cashRetailAmount =
    offer.priceType === 'MEMBERSHIP' && offer.prescription?.id != null
      ? cashRetailByPrescription.get(offer.prescription.id)
      : undefined;

  return {
    name: offer.prescription?.treatment?.name,
    pricingType: offer.priceType,
    amount: getAmountAfterPromotions(offer),
    retailAmount: cashRetailAmount ?? offer.prescriptionPrice?.retailAmount,
    promotions: offer.prescriptionPrice?.promotions
  };
}

// Cheapest wins; a priced offer beats an unpriced one; ties go to the membership price.
function cheapestOffer(offers: OfferPrescription[]): OfferPrescription {
  return offers.reduce((cheapest, candidate) => {
    const candidateAmount = getAmountAfterPromotions(candidate);
    const cheapestAmount = getAmountAfterPromotions(cheapest);
    if (candidateAmount == null) return cheapest;
    if (cheapestAmount == null) return candidate;
    if (candidateAmount === cheapestAmount) {
      return candidate.priceType === 'MEMBERSHIP' ? candidate : cheapest;
    }
    return candidateAmount < cheapestAmount ? candidate : cheapest;
  });
}

// Number of days a delivery promise resolves to, using the upper bound of any range
// ("Delivers in 2-5 days" → 5) so the slowest promise can be picked.

function promisedDays(deliveryPromise: string): number {
  const match = deliveryPromise.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*day/i);
  if (!match) {
    return 0;
  }
  return parseInt(match[2] ?? match[1], 10);
}

// The whole order arrives when its slowest medication does.
function getLatestDeliveryEstimate(offers: OfferPrescription[]): string | undefined {
  const promises = offers
    .map((offer) => offer.deliveryEstimate?.deliveryPromise)
    .filter((promise): promise is string => promise != null);

  if (promises.length === 0) {
    return undefined;
  }

  return [...promises].sort((a, b) => promisedDays(b) - promisedDays(a))[0];
}

// Sums only the values we have so an unpriced medication doesn't zero out the total.
function sumDefined(values: Array<number | undefined>): number | undefined {
  return values.reduce<number | undefined>(
    (total, value) => (value == null ? total : (total ?? 0) + value),
    undefined
  );
}

function getCostAmountTitle(prescriptions: OfferPrescriptionView[]): string | undefined {
  const priceTypes = new Set(prescriptions.map((prescription) => prescription.pricingType));
  if (priceTypes.size > 1) {
    return MIXED_PRICE_TITLE;
  }

  const [priceType] = priceTypes;
  return priceType ? PRICE_TYPE_TITLES[priceType as OfferPriceType] : undefined;
}

// The pricing, delivery estimate and per-prescription breakdown for one pharmacy's offer,
// chosen by taking the cheapest offer per prescription and summing them.
export function summarizePharmacyOffer(
  offers: OfferPrescription[] | undefined,
  source?: string | null
): Pick<PharmacyOffer, 'deliveryEstimate' | 'pricing' | 'prescriptions'> {
  // Insurance estimates are only trusted from ARRIVE (not Amazon's yet), which sends nothing else
  const priceTypes: OfferPriceType[] =
    source === OFFER_SOURCE.ARRIVE ? ['INSURANCE'] : BEST_PRICE_TYPES;
  const candidates = (offers ?? []).filter(
    (offer) =>
      offer.priceType != null &&
      priceTypes.includes(offer.priceType) &&
      offer.prescription?.id != null
  );

  if (candidates.length === 0) {
    return { pricing: {}, prescriptions: [] };
  }

  const cashRetailByPrescription = buildCashRetailByPrescription(candidates);
  const chosen = Object.values(_.groupBy(candidates, (offer) => offer.prescription!.id)).map(
    cheapestOffer
  );
  const prescriptions = chosen.map((offer) => toPrescriptionView(offer, cashRetailByPrescription));

  return {
    deliveryEstimate: getLatestDeliveryEstimate(chosen),
    pricing: {
      costAmount: sumDefined(prescriptions.map((prescription) => prescription.amount)),
      costAmountTitle: getCostAmountTitle(prescriptions),
      retailAmount: sumDefined(prescriptions.map((prescription) => prescription.retailAmount)),
      retailAmountTitle: RETAIL_TITLE
    },
    prescriptions
  };
}

export function toPaymentOption(pricing?: OfferPricing): PaymentOption | undefined {
  // if we aren't explicitly given the cost amount, we'll expect patients to pay the retail amount
  const amount = pricing?.costAmount ?? pricing?.retailAmount;
  if (!pricing || amount == null) {
    return undefined;
  }

  return {
    label: pricing.costAmountTitle ?? pricing.retailAmountTitle ?? '',
    amount,
    retailAmount: pricing.retailAmount
  };
}

// every price shown on one pharmacy's card, from its offers and its own coupon price
export function buildPaymentOptions({
  pharmacy,
  offerGroup,
  showPrice
}: {
  pharmacy?: Pick<EnrichedPharmacy, 'price' | 'retailPrice'>;
  offerGroup?: PharmacyOfferGroup;
  showPrice?: boolean;
}): PaymentOption[] {
  // GoodRx/RxSense prices come from the pharmacy search, so we shape one into an option here
  // until coupons are offers too
  const couponOption: PaymentOption | undefined =
    showPrice && pharmacy?.price != null
      ? { label: t.couponPrice, amount: pharmacy.price, retailAmount: pharmacy.retailPrice }
      : undefined;

  return [
    ...(offerGroup?.offers.map((offer) => toPaymentOption(offer.pricing)) ?? []),
    couponOption
  ].filter((option): option is PaymentOption => !!option);
}

function sourceRank(offer: PharmacyOffer): number {
  const index = CLIENT_SOURCE_PRIORITY.indexOf(offer.source ?? '');
  return index === -1 ? CLIENT_SOURCE_PRIORITY.length : index;
}

// Promoted first, then by source priority, so the card doesn't depend on the order the API
// returned bundles in. Sort is stable, so offers that rank the same keep that order.
function byPrecedence(a: PharmacyOffer, b: PharmacyOffer): number {
  return Number(!!b.isPromoted) - Number(!!a.isPromoted) || sourceRank(a) - sourceRank(b);
}

// one group per pharmacy, in the order each pharmacy's first offer appears
export function groupOffersByPharmacy(offers: PharmacyOffer[]): PharmacyOfferGroup[] {
  return Object.values(_.groupBy(offers, (offer) => offer.pharmacy.id)).map((pharmacyOffers) => ({
    pharmacy: pharmacyOffers[0].pharmacy,
    offers: [...pharmacyOffers].sort(byPrecedence)
  }));
}

// The offer whose attributes stand for the whole card — its tags, delivery estimate, other attributes.
// One offer rather than a merge, until there's UI for showing each offer's own.
export function representativeOffer(group?: PharmacyOfferGroup): PharmacyOffer | undefined {
  return group?.offers[0];
}

// the best-priced offer's pricing, so cost and retail always come from the same offer
export function cheapestPricing(group?: PharmacyOfferGroup): OfferPricing | undefined {
  return (group?.offers ?? [])
    .filter((offer) => offer.pricing.costAmount != null)
    .sort((a, b) => a.pricing.costAmount! - b.pricing.costAmount!)[0]?.pricing;
}

// because offers aren't actually pharmacies
// we'll transform them into things that resemble pharamcy objects
export function toPharmacyLike(group: PharmacyOfferGroup) {
  const pricing = cheapestPricing(group);

  return {
    id: group.pharmacy.id,
    name: group.pharmacy.name,
    fulfillmentTypes: group.pharmacy.fulfillmentTypes,
    logo: group.pharmacy.logo,
    price: pricing?.costAmount,
    retailPrice: pricing?.retailAmount
  };
}

// tags across a pharmacy's offers, deduped by kind
export function getOfferTags(offers: PharmacyOffer[]): OfferAttributeTag[] {
  return [...new Map(offers.flatMap((offer) => offer.tags).map((tag) => [tag.kind, tag])).values()];
}
