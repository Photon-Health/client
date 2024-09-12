import dayjs from 'dayjs';
import { Text } from '@chakra-ui/react';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import { Maybe } from '../__generated__/graphql';
import { OrderFulfillment } from '../utils/models';
import { roundUpTo15MinInterval } from '../utils/dates';

dayjs.extend(isTomorrow);

interface ReadyTextProps {
  readyBy?: string;
  readyByTime?: Date;
  isDeliveryPharmacy?: boolean;
  fulfillment?: Maybe<OrderFulfillment>;
}

export const ReadyText = ({
  readyBy,
  readyByTime,
  isDeliveryPharmacy,
  fulfillment
}: ReadyTextProps) => {
  if (isDeliveryPharmacy) return null;

  // No fulfillment means user came from pharmacy selection
  if ((!fulfillment || fulfillment?.state === 'SENT') && readyBy && readyByTime) {
    return <PatientDesiredReadyBy readyBy={readyBy} readyByTime={readyByTime} />;
  }

  if (fulfillment?.state === 'RECEIVED' && fulfillment?.pharmacyEstimatedReadyAt) {
    return (
      <PharmacyEstimatedReadyAt pharmacyEstimatedReadyAt={fulfillment.pharmacyEstimatedReadyAt} />
    );
  }

  return null;
};

interface PharmacyEstimatedReadyAtProps {
  pharmacyEstimatedReadyAt: Date;
}
const PharmacyEstimatedReadyAt = ({ pharmacyEstimatedReadyAt }: PharmacyEstimatedReadyAtProps) => {
  const rounded = roundUpTo15MinInterval(pharmacyEstimatedReadyAt);
  const readyAtDayjs = dayjs(rounded);
  const timeFormat = readyAtDayjs.minute() ? 'h:mm a' : 'h a';
  const now = dayjs();
  const isFuture = now.isBefore(readyAtDayjs);

  if (readyAtDayjs.isToday() && isFuture) {
    return (
      <Text>
        Ready at <b>{readyAtDayjs.format(timeFormat)}</b>
      </Text>
    );
  } else if (readyAtDayjs.isTomorrow()) {
    return (
      <Text>
        Ready <b>tomorrow at {readyAtDayjs.format(timeFormat)}</b>
      </Text>
    );
  } else {
    // For datetimes in the past or far in the future, just append the date
    return (
      <Text>
        Ready{' '}
        <b>
          {readyAtDayjs.format('ddd, MMM D')} at {readyAtDayjs.format(timeFormat)}
        </b>
      </Text>
    );
  }
};

interface PatientDesiredReadyByProps {
  readyBy: string;
  readyByTime: Date;
}
const PatientDesiredReadyBy = ({ readyBy, readyByTime }: PatientDesiredReadyByProps) => {
  const readyByTimeDayJs = dayjs(readyByTime);
  const isToday = readyByTimeDayJs.isToday();
  const isTomorrow = readyByTimeDayJs.isTomorrow();
  const now = dayjs();
  const isFuture = now.isBefore(readyByTimeDayJs);

  if (readyBy === 'Urgent') {
    return (
      <Text>
        Need order <b>as soon as possible</b>
      </Text>
    );
  } else if (readyBy === 'After hours') {
    if (isToday && isFuture) {
      return (
        <Text>
          Need order <b>this evening</b>
        </Text>
      );
    } else if (isTomorrow) {
      return (
        <Text>
          Need order <b>tomorrow evening</b>
        </Text>
      );
    } else {
      // Let's not surface anything here until we decide on copy
      return null;
    }
  } else {
    const [time, period] = readyBy.split(' ');
    const [hour] = time.split(':');

    if (isToday && isFuture) {
      return (
        <Text>
          Need order by{' '}
          <b>
            {hour} {period}
          </b>
        </Text>
      );
    } else if (isTomorrow) {
      return (
        <Text>
          Need order by{' '}
          <b>
            tomorrow at {hour} {period}
          </b>
        </Text>
      );
    } else {
      // Requested time is in the past, this would happen if we don't get around to confirming it
      return (
        <Text>
          Need order by{' '}
          <b>
            {readyByTimeDayJs.format('ddd, MMM D')} at {hour} {period}
          </b>
        </Text>
      );
    }
  }
};
