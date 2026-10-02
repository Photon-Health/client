import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { EnrichedPharmacy, PharmacyOffer, PharmacyOfferGroup } from '../models';
import { buildPaymentOptions } from '../offers';
import { useOrderContext } from '../../views/Main';
import { deriveCostType, getOfferType } from '../offerAnalytics';
import { Prescription } from '../../__generated__/graphql';
import { usePatientAnalytics } from '../../hooks/usePatientAnalytics';

// this is a set of offer impression keys that have been tracked
// emptied on page load so as not to track impressions unnecessarily
const trackedOfferImpressions = new Set<string>();

function getOfferImpressionKey(orderId: string, pharmacyId: string, offerType: string): string {
  return `${orderId}:${pharmacyId}:${offerType}`;
}

const OfferImpressionTracker = ({
  children,
  offerGroup,
  showPrice,
  pharmacy,
  ordinalPosition,
  isAlreadySelected,
  enabled
}: {
  children: React.ReactNode;
  offerGroup?: PharmacyOfferGroup;
  showPrice?: boolean;
  pharmacy: EnrichedPharmacy;
  ordinalPosition: number;
  isAlreadySelected: boolean;
  enabled: boolean;
}) => {
  const patientAnalytics = usePatientAnalytics();
  const { order } = useOrderContext();

  // one impression per option on the card, whether or not it has a price
  const trackImpression = (offer?: PharmacyOffer) => {
    const offerType = getOfferType({ pharmacy, offer }) ?? 'None';

    // only wanna track impressions per order/pharmacy/offer type per page load
    // to minimize impressione explosion when swappin between tabs
    const impressionKey = getOfferImpressionKey(order.id, pharmacy.id, offerType);
    if (trackedOfferImpressions.has(impressionKey)) {
      return;
    }

    trackedOfferImpressions.add(impressionKey);

    const rxIds = new Set(
      order.fills
        .map((f) => f.prescription)
        .filter((p): p is Prescription => !!p)
        .map((p) => p.id)
    );

    // the coupon price belongs to the pharmacy, not to any offer
    const couponPrice = offer ? undefined : pharmacy.price;
    const couponRetailPrice = offer ? undefined : pharmacy.retailPrice;
    const price = offer?.pricing.costAmount || couponPrice;

    patientAnalytics.track('Offer Impression', order, {
      offerType,
      offerShown: !!price,
      pharmacyFulfillmentType: pharmacy.fulfillmentTypes?.[0] ?? 'None',
      pharmacy_id: pharmacy.id,
      pharmacy_name: pharmacy.name,
      ordinal_position: ordinalPosition,
      distance: pharmacy.distance,
      price: couponPrice,
      retailPrice: couponRetailPrice,
      showReadyIn30Min: pharmacy.showReadyIn30Min,
      is24Hr: pharmacy.is24Hr,
      isClosingSoon: pharmacy.isClosingSoon,
      isAlreadySelected: isAlreadySelected,
      deliveryEstimate: offer?.deliveryEstimate,
      costType: offer ? deriveCostType(offer) : undefined,
      costAmount: offer?.pricing.costAmount,
      costAmountTitle: offer?.pricing.costAmountTitle,
      retailAmount: offer?.pricing.retailAmount,
      retailAmountTitle: offer?.pricing.retailAmountTitle,
      numPrescriptions: rxIds.size,
      multiMedOffer: rxIds.size > 1,
      hasRefills: rxIds.size < order.fills.length,
      tags: offer?.tags?.map((tag) => tag.label),
      promotions: offer?.prescriptions?.flatMap(
        (med) =>
          med.promotions?.map((promo) => ({
            medicationName: med.name,
            ...promo
          })) ?? []
      ),
      medicationCosts: offer?.prescriptions
    });
  };

  const { ref } = useInView({
    triggerOnce: true,
    rootMargin: '-100px',
    onChange: (inView) => {
      if (inView && enabled) {
        // a priceless offer is still shown, via its tags
        offerGroup?.offers.forEach(trackImpression);

        // asking buildPaymentOptions keeps one answer to whether the coupon row is rendered
        const showsCouponPrice = buildPaymentOptions({ pharmacy, showPrice }).length > 0;
        // a pharmacy with neither is still worth recording as seen
        if (showsCouponPrice || !offerGroup?.offers.length) {
          trackImpression();
        }
      }
    }
  });

  return <div ref={ref}>{children}</div>;
};

export { OfferImpressionTracker };
