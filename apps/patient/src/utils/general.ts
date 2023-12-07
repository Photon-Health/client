import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import isToday from 'dayjs/plugin/isToday';
import { types } from '@photonhealth/sdk';
import { ExtendedFulfillmentType } from './models';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { getPlace } from '../api';
import capsuleZipcodeLookup from '../data/capsuleZipcodes.json';

dayjs.extend(isoWeek);
dayjs.extend(isBetween);
dayjs.extend(isToday);

export const titleCase = (str: string) =>
  str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const formatAddress = (address: types.Address) => {
  const { city, postalCode, state, street1, street2 } = address;
  return `${titleCase(street1)}${street2 ? `, ${titleCase(street2)}` : ''}, ${titleCase(
    city
  )}, ${state} ${postalCode}`;
};

// Format date to local date string (MM/DD/YYYY)
export const formatDate = (date: string | Date) => new Date(date)?.toLocaleDateString();

/**
 * There is a delay before order fulfillment is created, so a query
 * param is used to assume fulfillment type coming from pharmacy selection.
 */
export const getFulfillmentType = (
  pharmacyId?: string,
  fulfillment?: types.OrderFulfillment,
  param?: string
): ExtendedFulfillmentType => {
  // We don't have COURIER fulfillment type yet, so manually check for those
  if (pharmacyId in capsuleZipcodeLookup) {
    return 'COURIER';
  }

  // Next, try order fulfillment type
  if (fulfillment?.type) {
    return fulfillment.type;
  }

  // Next, try query param if it's set
  const fulfillmentTypes: ExtendedFulfillmentType[] = [
    ...Object.values(types.FulfillmentType),
    'COURIER' as ExtendedFulfillmentType
  ];
  const foundType = fulfillmentTypes.find((val) => val === param);
  if (foundType) {
    return foundType;
  }

  // Fallback to pickup
  return types.FulfillmentType.PickUp;
};

/**
 * Flatten the returned fills array and count each unique
 * fill by treatment name
 */
type FillWithCount = types.Fill & { count: number };
export const countFillsAndRemoveDuplicates = (fills: types.Fill[]): FillWithCount[] => {
  const count = {};
  const result = [];

  for (const fill of fills) {
    const str = fill.treatment.id;

    if (count[str]) {
      // Increment count if treatment name already exists
      count[str]++;

      // Update count on existing object in result array
      const existingFill = result.find((o) => o.treatment.id === str);
      if (existingFill) {
        existingFill.count = count[str];
      }
    } else {
      // Add new treatment name and count if it does not exist
      count[str] = 1;
      const fillWithCount: FillWithCount = { ...fill, count: count[str] };
      result.push(fillWithCount);
    }
  }
  return result;
};

function isOpenEvent(event: types.PharmacyEvent): event is types.PharmacyOpenEvent {
  return event.type === 'open';
}

function isCloseEvent(event: types.PharmacyEvent): event is types.PharmacyCloseEvent {
  return event.type === 'close';
}

export const preparePharmacy = async (
  pharmacy: types.Pharmacy,
  includeRating = true
): Promise<EnrichedPharmacy> => {
  try {
    const queryText = `${pharmacy.name} ${pharmacy.address ? formatAddress(pharmacy.address) : ''}`;
    const queryFields = ['rating'];

    const rating = includeRating ? (await getPlace(queryText, queryFields))?.rating : null;

    let is24Hr = false;
    let opens = '';
    let closes = '';

    if (pharmacy.nextEvents) {
      is24Hr = pharmacy.nextEvents[pharmacy.isOpen ? 'open' : 'close'].type === '24hr';

      // Prepare opens string, ex: Opens 8AM Wed
      const nextOpen = isOpenEvent(pharmacy.nextEvents.open)
        ? pharmacy.nextEvents.open.datetime
        : undefined;
      const formatter = `${dayjs(nextOpen).minute() > 0 ? 'h:mmA' : 'hA'}${
        dayjs(nextOpen).isToday() ? '' : ' ddd'
      }`;
      const oTime = dayjs(nextOpen).format(formatter);
      opens = `Opens ${oTime}`;

      // Prepare closes string, ex: Closes 6PM
      const nextClose = isCloseEvent(pharmacy.nextEvents.close)
        ? pharmacy.nextEvents.close.datetime
        : undefined;
      const cTime = dayjs(nextClose).format(dayjs(nextClose).minute() > 0 ? 'h:mmA' : 'hA');
      closes = `Closes ${cTime}`;
    }

    return {
      ...pharmacy,
      rating: rating || undefined,
      is24Hr,
      opens,
      closes
    };
  } catch (error) {
    console.log('Failed to prepare pharmacy metadata: ' + error.message);
    return pharmacy;
  }
};
