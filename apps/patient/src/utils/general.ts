import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import { types } from 'packages/sdk';
import { FulfillmentType } from './models';

dayjs.extend(isoWeek);
dayjs.extend(isBetween);

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

export const getHours = (
  periods: { close: { day: number; time: string }; open: { day: number; time: string } }[],
  currentTime: string
) => {
  /**
   * There are 1-2 periods per day. For example CVS may have an hour off for
   * lunch so google will show two "periods" with the same "day", like
   * 0830-1200, 1300-2000.
   *
   * Todo:
   *  - Add timezone support. Not urgent since user is usually in same tz as pharmacy.
   */

  const now = dayjs(currentTime, 'HHmm');
  const today = now.isoWeekday();
  let nextOpenTime = null;
  let nextOpenDay = null;
  let nextCloseTime = null;
  let is24Hr = false;

  if (periods?.length === 1) is24Hr = true;

  if (periods && !is24Hr) {
    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      const open = period.open.time;
      const close = period.close.time;

      if (period.open.day === today) {
        if (now.isBetween(dayjs(open, 'HHmm'), dayjs(close, 'HHmm'))) {
          nextCloseTime = close;
        } else if (!nextOpenTime && now.isBefore(dayjs(open, 'HHmm'))) {
          nextOpenTime = open;
        }
      }
    }

    // after hours
    if (!nextOpenTime) {
      const indexOfLastCurrentDayPeriod = periods.lastIndexOf(
        // clone periods to get around reverse-in-place
        [...periods].reverse().find((per) => per.close.day === today)
      );
      const nextPeriod =
        indexOfLastCurrentDayPeriod === periods.length - 1
          ? periods[0]
          : periods[indexOfLastCurrentDayPeriod + 1];
      nextOpenTime = nextPeriod.open.time;
      nextOpenDay = dayjs().isoWeekday(nextPeriod.open.day).format('ddd');
    }
  }

  return {
    is24Hr,
    opens: nextOpenTime,
    opensDay: nextOpenDay,
    closes: nextCloseTime
  };
};

/**
 * We can't simply use the order fulfillment type since we don't have the "courier"
 * type yet. Also there is a ~30s delay before order fulfillment is created
 * after pharmacy selection, so a query param is needed.
 */
export const getFullfillmentType = (
  orgSettings: any,
  pharmacyId?: string,
  param?: string
): FulfillmentType => {
  // Prioritize pharmacyId over query param
  if (pharmacyId) {
    if (orgSettings.mailOrderNavigateProviders.includes(pharmacyId)) {
      return 'mailOrder';
    }
    if (orgSettings.courierProviders.includes(pharmacyId)) {
      return 'courier';
    }
  }
  // Next use query param if it's set
  const fulfillmentTypes: FulfillmentType[] = ['courier', 'mailOrder', 'pickup'];
  const fType = fulfillmentTypes.find((val) => val === param);
  if (fType) {
    return fType;
  }
  // Fallback to pickup
  return 'pickup';
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
