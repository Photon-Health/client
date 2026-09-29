import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import type { HoursProps } from '@photon-health/ui';
import { CandidatePharmacy, PharmacyEvent, PharmacyOption } from '../api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday);

// Ported from apps/patient/src/utils/{general,formatters}.ts — the lift-out
// contract forbids importing across the intake boundary. Keep the copies in
// step; /pharmacy is the reference behaviour.

const CLOSING_SOON_MINUTES = 30;

const eventDatetime = (event: PharmacyEvent | undefined, type: string) =>
  event?.type === type ? event.datetime ?? undefined : undefined;

type OpenState = {
  is24Hr: boolean;
  isClosingSoon: boolean;
  opens: string;
  closes: string;
};

export const derivePharmacyOpenState = (
  nextEvents: CandidatePharmacy['nextEvents'],
  isOpen: boolean | null | undefined
): OpenState => {
  if (!nextEvents) {
    return { is24Hr: false, isClosingSoon: false, opens: '', closes: '' };
  }

  const is24Hr = nextEvents[isOpen ? 'open' : 'close'].type === '24hr';

  const nextOpen = eventDatetime(nextEvents.open, 'open');
  const openFormat = `${dayjs(nextOpen).minute() > 0 ? 'h:mm a' : 'h a'}${
    dayjs(nextOpen).isToday() ? '' : ' ddd'
  }`;
  const opens = `Opens ${dayjs(nextOpen).format(openFormat)}`;

  const nextClose = eventDatetime(nextEvents.close, 'close');
  let closes = `Closes ${dayjs(nextClose).format(
    dayjs(nextClose).minute() > 0 ? 'h:mm a' : 'h a'
  )}`;

  let isClosingSoon = false;
  if (!is24Hr && nextClose) {
    const closesInMins = dayjs(nextClose).tz(dayjs.tz.guess()).diff(dayjs(), 'minutes');
    if (closesInMins < CLOSING_SOON_MINUTES) {
      isClosingSoon = true;
      closes = `Closes in ${closesInMins} mins`;
    }
  }

  return { is24Hr, isClosingSoon, opens, closes };
};

/** Undefined when we hold no hours — the card then renders no hours line. */
export const cardHours = (option: PharmacyOption): HoursProps | undefined => {
  const isOpen = option.pharmacy?.isOpen;
  if (isOpen == null) {
    return undefined;
  }

  const { is24Hr, isClosingSoon, opens, closes } = derivePharmacyOpenState(
    option.pharmacy?.nextEvents,
    isOpen
  );

  if (is24Hr) {
    return { state: 'open', detail: 'Open 24 hours' };
  }
  if (isClosingSoon) {
    return { state: 'closingSoon', detail: closes };
  }
  return isOpen ? { state: 'open', detail: closes } : { state: 'closed', detail: opens };
};

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const formatAddress = (address: NonNullable<CandidatePharmacy['address']>) => {
  const { street1, street2, city, state, postalCode } = address;
  if (!street1) {
    return undefined;
  }
  const lines = [
    titleCase(street1),
    street2 ? titleCase(street2) : undefined,
    city ? titleCase(city) : undefined
  ].filter(Boolean);
  return `${lines.join(', ')}${state ? `, ${state}` : ''}${postalCode ? ` ${postalCode}` : ''}`;
};

/** PharmacyCard's `address` is one string carrying street and distance. */
export const cardAddress = (option: PharmacyOption): string | undefined => {
  const address = option.pharmacy?.address ? formatAddress(option.pharmacy.address) : undefined;
  if (!address) {
    return undefined;
  }
  return option.distanceMiles == null
    ? address
    : `${option.distanceMiles.toFixed(1)} mi · ${address}`;
};
