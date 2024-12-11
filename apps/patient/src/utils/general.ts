import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isToday from 'dayjs/plugin/isToday';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import costcoLogo from '../assets/costco_logo_small.png';
import walgreensLogo from '../assets/walgreens_logo_small_circle.png';
import { COMMON_COURIER_PHARMACY_IDS } from '../data/courierPharmacys';
import { Address, EnrichedPharmacy, Fill, OrderFulfillment, Pharmacy } from '../utils/models';
import { ExtendedFulfillmentType } from './models';
import { PharmacyCloseEvent, PharmacyEvent, PharmacyOpenEvent } from '../__generated__/graphql';
import { PHARMACY_BRANDING } from '../components';

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

export const formatAddress = (address: Address) => {
  const { city, postalCode, state, street1, street2 } = address;
  return `${titleCase(street1)}${street2 ? `, ${titleCase(street2)}` : ''}, ${titleCase(
    city
  )}, ${state} ${postalCode}`;
};

// Format date to local date string (MM/DD/YYYY)
export const formatDate = (date: string | Date) => new Date(date)?.toLocaleDateString();

/**
 * There is a delay before order fulfillment is created, so a query
 * defaultType is used to assume fulfillment type coming from pharmacy selection.
 */
export const getFulfillmentType = (
  pharmacyId?: string,
  fulfillment?: OrderFulfillment,
  defaultType?: string
): ExtendedFulfillmentType => {
  // We don't have COURIER fulfillment type yet, so manually check for those
  if (COMMON_COURIER_PHARMACY_IDS.includes(pharmacyId ?? '')) {
    return 'COURIER';
  }

  // Next, try order fulfillment type
  if (fulfillment?.type) {
    return fulfillment.type;
  }

  // Next, try query defaultType if it's set
  const fulfillmentTypes: ExtendedFulfillmentType[] = ['COURIER', 'MAIL_ORDER', 'PICK_UP'];
  const foundType = fulfillmentTypes.find((val) => val === defaultType);
  if (foundType) {
    return foundType;
  }

  // Fallback to pickup
  return 'PICK_UP';
};

/**
 * Flatten the returned fills array and count each unique
 * fill by treatment name
 */
export type FillWithCount = Fill & { count: number };
export const countFillsAndRemoveDuplicates = (fills: (Fill | FillWithCount)[]): FillWithCount[] => {
  // First, count the occurrences of each treatment.id
  const counts = fills.reduce((acc, fill) => {
    const id = fill.treatment.id;
    if (!(id in acc)) {
      acc[id] = 0;
    }
    acc[id] += 'count' in fill ? fill.count : 1;
    return acc;
  }, {} as Record<string, number>);

  // Then, create a map of distinct fills with updated counts
  const distinctFills = fills.reduce((acc: Map<string, FillWithCount>, fill) => {
    const id = fill.treatment.id;
    if (!acc.has(id)) {
      acc.set(id, { ...fill, count: counts[id] });
    }
    return acc;
  }, new Map<string, FillWithCount>());

  // Convert the map values to an array and return
  return Array.from(distinctFills.values());
};

function isOpenEvent(event: PharmacyEvent): event is PharmacyOpenEvent {
  return event.type === 'open';
}

function isCloseEvent(event: PharmacyEvent): event is PharmacyCloseEvent {
  return event.type === 'close';
}

export function isDelivery({
  pharmacy,
  fulfillmentType
}: {
  pharmacy?: Pharmacy;
  fulfillmentType: ExtendedFulfillmentType;
}): boolean {
  return (
    fulfillmentType === 'MAIL_ORDER' ||
    fulfillmentType === 'COURIER' ||
    [
      'phr_01GA9HPV5XYTC1NNX213VRRBZ3', // Amazon Pharmacy
      'phr_01HH0B05XNYH876AY8JZ7BD256', // Cost Plus Pharmacy
      'phr_01GA9HPXGSDTSB0Z70BRK5XEP0' // Walmart Mail Order Pharmacy
    ].includes(pharmacy?.id as string)
  );
}

export const preparePharmacy = (
  pharmacy: Pharmacy,
  fulfillmentType?: ExtendedFulfillmentType
): EnrichedPharmacy => {
  let is24Hr = false;
  let isClosingSoon = false;
  let opens = '';
  let closes = '';
  let showReadyIn30Min = false;
  let logo = null;

  // for mail-order pharmacies, use the info mapped by this branding constant
  if (fulfillmentType && isDelivery({ pharmacy, fulfillmentType })) {
    return {
      ...pharmacy,
      ...PHARMACY_BRANDING[pharmacy.id]
    };
  }

  // Add logo and urgent badge to certain pharmacies
  const pharmacyNameLowerCase = pharmacy.name.toLowerCase();
  if (pharmacyNameLowerCase.includes('walgreens')) {
    logo = walgreensLogo;
    showReadyIn30Min = true;
  } else if (pharmacyNameLowerCase.includes('costco')) {
    logo = costcoLogo;
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

export const convertReadyByToUTCTimestamp = (readyBy: string, readyByDay: string): Date => {
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
      throw new Error('Invalid time selection');
  }

  if (readyByDay === 'Tomorrow') {
    targetTime = targetTime.add(1, 'day');
  }

  return targetTime.utc().toDate();
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const isOrgWithCouponsEnabled = (orgName: string) =>
  [
    'Sesame',
    'Updated Test Pharmacy 11', // boson us
    'Photon Test Org' // neutron us
  ].includes(orgName);
