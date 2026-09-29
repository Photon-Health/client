import type { PriceRowItem, TagTone } from '@photon-health/ui';
import { PharmacyOption } from '../api/types';

/**
 * `attributeTags.kind` is a free string on the wire, but Tag's tones are a
 * closed set and an unknown tone throws rather than falling back — so every
 * kind is mapped explicitly and anything unrecognised lands on a default.
 */
const TAG_TONES: Record<string, TagTone> = {
  convenience: 'convenience',
  relationship: 'relationship',
  offer: 'offer',
  status: 'status',
  price: 'offer',
  savings: 'offer',
  speed: 'convenience',
  delivery: 'convenience',
  availability: 'status',
  stock: 'status',
  preferred: 'relationship'
};

const toTone = (kind: string): TagTone => TAG_TONES[kind.toLowerCase()] ?? 'status';

const PRICE_LABELS: Record<string, string> = {
  CASH: 'Without insurance',
  INSURANCE: 'With insurance',
  MEMBERSHIP: 'Membership price'
};

/** Cents are not in play here — the API returns dollars as a Float. */
const usd = (amount: number) =>
  amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/**
 * Both lists are deduped by label because the card keys its tags and price
 * rows on it, and a pharmacy can carry several offers saying the same thing.
 */
export const cardTags = (pharmacy: PharmacyOption): { tone: TagTone; label: string }[] => {
  const tags = pharmacy.offers.flatMap((offer) =>
    offer.attributeTags.map((tag) => ({ tone: toTone(tag.kind), label: tag.label }))
  );
  return [...new Map(tags.map((tag) => [tag.label, tag])).values()];
};

export const cardPrices = (pharmacy: PharmacyOption): PriceRowItem[] => {
  const rows = pharmacy.offers.flatMap((offer) => {
    const summary = offer.priceSummary;
    if (!summary || summary.totalAmount == null) return [];

    const label = PRICE_LABELS[summary.priceType ?? ''] ?? 'Price';
    const offerRows: PriceRowItem[] = [
      {
        kind: 'price',
        label,
        value: usd(summary.totalAmount),
        ...(summary.totalSavings ? { badge: `Save ${usd(summary.totalSavings)}` } : {})
      }
    ];

    // A retail price above what we quote is the was-price beside the better one.
    if (summary.totalRetailAmount != null && summary.totalRetailAmount > summary.totalAmount) {
      offerRows.push({
        kind: 'price',
        label: 'Retail',
        value: usd(summary.totalRetailAmount),
        strikeout: true
      });
    }
    return offerRows;
  });
  return [...new Map(rows.map((row) => [row.label, row])).values()];
};

export const cardDeliveryPromise = (pharmacy: PharmacyOption): string | undefined =>
  pharmacy.offers.flatMap((offer) => offer.prescriptionDeliveryEstimates)[0]?.deliveryPromise;
