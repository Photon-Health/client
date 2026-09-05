import _ from 'lodash';
import { OfferPriceType } from '../__generated__/graphql';
import {
  OfferPrescriptionSummary,
  PrescriptionOffer,
  OfferBundleComputed,
  OfferPromotionTypes,
  Promotion
} from './models';

export const OFFER_SOURCE = {
  AMAZON_PHARMACY: 'AMAZON_PHARMACY',
  NOVOCARE: 'NOVOCARE'
} as const;

// attributeTag kind marking a paid-placement (sponsored) offer
export const SPONSORED_TAG_KIND = 'SPONSORED';

// Display titles for price types. Currently, only Amazon Pharmacy has potential to serve MEMBERSHIP offers
const PRICE_TYPE_TITLES: Record<OfferPriceType, string> = {
  MEMBERSHIP: 'Prime Member Price',
  CASH: 'Cash Price',
  INSURANCE: 'Insurance Estimate'
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
function getAmountAfterPromotions(offer: PrescriptionOffer): number | undefined {
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

function buildCashRetailByPrescription(offers: PrescriptionOffer[]): Map<string, number> {
  return offers.reduce<Map<string, number>>((cashRetail, offer) => {
    const prescriptionId = offer.prescription?.id;
    const retailAmount = offer.prescriptionPrice?.retailAmount;
    if (offer.priceType !== 'CASH' || prescriptionId == null || retailAmount == null) {
      return cashRetail;
    }
    return cashRetail.set(prescriptionId, retailAmount);
  }, new Map());
}

function toMedication(
  offer: PrescriptionOffer,
  cashRetailByPrescription: Map<string, number>
): OfferPrescriptionSummary {
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
function cheapestOffer(offers: PrescriptionOffer[]): PrescriptionOffer {
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
function getLatestDeliveryEstimate(offers: PrescriptionOffer[]): string | undefined {
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

function getCostAmountTitle(medications: OfferPrescriptionSummary[]): string | undefined {
  const priceTypes = new Set(medications.map((medication) => medication.pricingType));
  if (priceTypes.size > 1) {
    return MIXED_PRICE_TITLE;
  }

  const [priceType] = priceTypes;
  return priceType ? PRICE_TYPE_TITLES[priceType as OfferPriceType] : undefined;
}

// Builds the card total, delivery estimate and per-medication breakdown for a bundle by
// choosing the cheapest offer per prescription and summing them.
export function summarizeOfferBundle(offers: PrescriptionOffer[] | undefined): OfferBundleComputed {
  const candidates = (offers ?? []).filter(
    (offer) =>
      offer.priceType != null &&
      BEST_PRICE_TYPES.includes(offer.priceType) &&
      offer.prescription?.id != null
  );

  if (candidates.length === 0) {
    return { medications: [] };
  }

  const cashRetailByPrescription = buildCashRetailByPrescription(candidates);
  const chosen = Object.values(_.groupBy(candidates, (offer) => offer.prescription!.id)).map(
    cheapestOffer
  );
  const medications = chosen.map((offer) => toMedication(offer, cashRetailByPrescription));

  return {
    deliveryEstimate: getLatestDeliveryEstimate(chosen),
    costAmount: sumDefined(medications.map((medication) => medication.amount)),
    costAmountTitle: getCostAmountTitle(medications),
    retailAmount: sumDefined(medications.map((medication) => medication.retailAmount)),
    retailAmountTitle: RETAIL_TITLE,
    medications
  };
}
