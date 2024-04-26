import { types } from '@photonhealth/sdk';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isToday from 'dayjs/plugin/isToday';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import costcoLogo from '../assets/costco_small.png';
import walgreensLogo from '../assets/walgreens_small.png';
import walmartLogo from '../assets/walmart_small.svg';
import { COMMON_COURIER_PHARMACY_IDS } from '../data/courierPharmacys';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { ExtendedFulfillmentType } from './models';
import walmartMedLookup from '../data/walmartMedPrices.json';

dayjs.extend(utc);
dayjs.extend(timezone);
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
  if (COMMON_COURIER_PHARMACY_IDS.includes(pharmacyId ?? '')) {
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
export type FillWithCount = types.Fill & { count: number };
export const countFillsAndRemoveDuplicates = (fills: types.Fill[]): FillWithCount[] => {
  const count: Record<string, number> = {};
  const result: FillWithCount[] = [];

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

export const preparePharmacy = (pharmacy: types.Pharmacy): EnrichedPharmacy => {
  let is24Hr = false;
  let isClosingSoon = false;
  let opens = '';
  let closes = '';
  let showReadyIn30Min = false;
  let logo = null;

  // Add logo and urgent badge to certain pharmacies
  const pharmacyNameLowerCase = pharmacy.name.toLowerCase();
  if (pharmacyNameLowerCase.includes('walgreens')) {
    logo = walgreensLogo;
    showReadyIn30Min = true;
  } else if (pharmacyNameLowerCase.includes('costco')) {
    logo = costcoLogo;
  } else if (pharmacyNameLowerCase.includes('walmart')) {
    logo = walmartLogo;
  }

  if (pharmacy.nextEvents) {
    is24Hr = pharmacy.nextEvents[pharmacy.isOpen ? 'open' : 'close'].type === '24hr';

    // Prepare opens string, ex: Opens 8AM Wed
    const nextOpen = isOpenEvent(pharmacy.nextEvents.open)
      ? pharmacy.nextEvents.open.datetime
      : undefined;
    const formatter = `${dayjs(nextOpen).minute() > 0 ? 'h:mm a' : 'h a'}${
      dayjs(nextOpen).isToday() ? '' : ' ddd'
    }`;
    const oTime = dayjs(nextOpen).format(formatter);
    opens = `Opens ${oTime}`;

    // Prepare closes string, ex: Closes 6PM
    const nextClose = isCloseEvent(pharmacy.nextEvents.close)
      ? pharmacy.nextEvents.close.datetime
      : undefined;
    const cTime = dayjs(nextClose).format(dayjs(nextClose).minute() > 0 ? 'h:mm a' : 'h a');
    closes = `Closes ${cTime}`;

    // Check if closing soon
    if (!is24Hr && nextClose) {
      const now = dayjs();
      const userTimezone = dayjs.tz.guess();
      const closesInMins = dayjs(nextClose).tz(userTimezone).diff(now, 'minutes');
      if (closesInMins < 30) {
        isClosingSoon = true;
        closes = `Closes in ${closesInMins} mins`;
      }
    }
  }

  return {
    ...pharmacy,
    logo,
    showReadyIn30Min,
    is24Hr,
    isClosingSoon,
    opens,
    closes
  };
};

export const convertReadyByToUTCTimestamp = (readyBy: string, readyByDay: string): string => {
  // Get the timezone for dayjs
  const userTimezone = dayjs.tz.guess();

  let targetTime: Dayjs;

  switch (readyBy) {
    case '10:00 am':
      targetTime = dayjs().tz(userTimezone).hour(10).minute(0).second(0);
      break;
    case '12:00 pm':
      targetTime = dayjs().tz(userTimezone).hour(12).minute(0).second(0);
      break;
    case '2:00 pm':
      targetTime = dayjs().tz(userTimezone).hour(14).minute(0).second(0);
      break;
    case '4:00 pm':
      targetTime = dayjs().tz(userTimezone).hour(16).minute(0).second(0);
      break;
    case '6:00 pm':
      targetTime = dayjs().tz(userTimezone).hour(18).minute(0).second(0);
      break;
    case 'After hours':
      // We're setting 'After hours' to 8:00 pm
      targetTime = dayjs().tz(userTimezone).hour(20).minute(0).second(0);
      break;
    case 'Urgent':
      targetTime = dayjs().tz(userTimezone);
      break;
    default:
      return 'Invalid time selection';
  }

  if (readyByDay === 'Tomorrow') {
    targetTime = targetTime.add(1, 'day');
  }

  return targetTime.utc().format();
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Calculates the total price of all fills in an order based on the pricing information
 * available in a Walmart medication list. All fills must match the pricing information
 * to be included in the total price calculation.
 *
 * @param {types.Fill[]} fills - An array of fills representing the medications in the order.
 * @returns {number} The total price of the order.
 */
export const getTotalWalmartOrderPrice = (fills: types.Fill[]): number => {
  let totalPrice = 0;
  let allFillsMatch = true;

  for (const fill of fills) {
    // Check if the fill is in the walmartMedLookup list
    const match = walmartMedLookup.find(
      (med) =>
        new RegExp(`${med.name}.*${med.strength}`, 'i').test(fill.treatment.name) &&
        med.daysSupply === fill?.prescription?.daysSupply &&
        med.dispenseQuantity === fill?.prescription?.dispenseQuantity
    );

    // If a matching fill is not found, set allFillsMatch to false
    if (!match) {
      allFillsMatch = false;
      break;
    }

    // If a matching fill is found, add its price to the total price
    totalPrice += match.price;
  }

  // If all fills match, return the total price; otherwise, return 0
  return allFillsMatch ? totalPrice : 0;
};
