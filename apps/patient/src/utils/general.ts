import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import { types } from 'packages/sdk';
import { ExtendedFulfillmentType } from './models';

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

const COMMON_COURIER_PHARMACY_IDS = [
  // Capsule
  'phr_01GA9HPXPE3GH9Z05QV4SMKQEB',
  'phr_01GA9HPXNDYN4MVG2XDHKDYMTE',
  'phr_01GA9HPXF9E7DB4S3QJAT37AYD',
  'phr_01GA9HPXF93FNNA7TY5TMCCHED',
  'phr_01GA9HPXEYZ0R4BDJYAV9X4FNB',
  'phr_01GA9HPX8W2SNZ4WZDF2QN3HAV',
  'phr_01GA9HPX5XAV6FXG5TNNGZ2KRW',
  'phr_01GA9HPX5R5VS4D95XHSKZTFJ0',
  'phr_01GA9HPX4BTXBJDRGRBZQ6W6GW',
  'phr_01GA9HPX48G27SCD3REFE9ZM6G',
  'phr_01GA9HPX3S85T10VTV4VV9T52W',
  'phr_01GA9HPX0HJDK7YWE3AX8VVJ53',
  'phr_01GA9HPWZRHQF8BZ5J9SQZKYRN',
  'phr_01GA9HPWY8K1EZTQM3K6EJZDAP',
  'phr_01GA9HPWV48P7XCXC2E8YBPFX9',
  'phr_01GA9HPWRTAQ8Y4RBWEY3JJK4Q',
  'phr_01GA9HPWP4J2AKFDK02ACCM9VX',
  'phr_01GA9HPWDZECXHRMR72SH9KHBS',
  'phr_01GA9HPVXFMVA7KJ21MRF3TSEN',
  'phr_01GA9HPVV8FHY4204CTDXAV3M0',
  'phr_01GA9HPVEDG5F5MRM1G0WEH65P',
  'phr_01GA9HPVCAF1Y2D5307JGF16BK',
  'phr_01GA9HPVARX6TMMZY0GMB5NB3N',
  'phr_01GA9HPV5YDASCR5MD4NX00XQZ',
  'phr_01GA9HPV3G7WPD0MFMAM4W1DYQ',
  // Alto
  'phr_01GA9HPXNGYD3YZQ1AZBREN4M4',
  'phr_01GA9HPXNE1X7VSYR4SD7HBDBR',
  'phr_01GA9HPXM26ZPAY8AVBE1YADMZ',
  'phr_01GA9HPXD68240FHX282QH251Q',
  'phr_01GA9HPX91JXAB4XQWEWXY16X3',
  'phr_01GA9HPX8VF3A2Y2YC3HDSZ2JC',
  'phr_01GA9HPX7CYVKC87QFTAXYKYA8',
  'phr_01GA9HPW0BCXEGA3WWTPSADRT0',
  'phr_01GA9HPVC68G1VY232JYDGQA3F',
  'phr_01GA9HPV3GWF9AS544ABDD01YJ',
  'phr_01G9CM93X1NFP1C9H9K50DPKHX'
];

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
  if (COMMON_COURIER_PHARMACY_IDS.includes(pharmacyId)) {
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
