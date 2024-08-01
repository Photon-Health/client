import dayjs from 'dayjs';
import { Text } from '@chakra-ui/react';
import { OrderFulfillment, Maybe } from 'packages/sdk/dist/types';
import isTomorrow from 'dayjs/plugin/isTomorrow';

dayjs.extend(isTomorrow);

interface ReadyTextProps {
  readyBy?: string;
  readyByTime?: string;
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

const roundUpTo15MinInterval = (pharmacyEstimatedReadyAt: Date): Date => {
  const estimatedReadyAt = new Date(pharmacyEstimatedReadyAt);
  const minutes = estimatedReadyAt.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;

  if (roundedMinutes >= 60) {
    estimatedReadyAt.setHours(estimatedReadyAt.getHours() + 1);
    estimatedReadyAt.setMinutes(0);
  } else {
    estimatedReadyAt.setMinutes(roundedMinutes);
  }

  estimatedReadyAt.setSeconds(0);
  estimatedReadyAt.setMilliseconds(0);
  return estimatedReadyAt;
};

interface PharmacyEstimatedReadyAtProps {
  pharmacyEstimatedReadyAt: Date;
}
const PharmacyEstimatedReadyAt = ({ pharmacyEstimatedReadyAt }: PharmacyEstimatedReadyAtProps) => {
  const rounded = roundUpTo15MinInterval(pharmacyEstimatedReadyAt);
  const timezone = dayjs.tz.guess();
  const readyAtDayjs = dayjs.utc(rounded).tz(timezone);
  const timeFormat = readyAtDayjs.minute() ? 'h:mm a' : 'h a';

  if (readyAtDayjs.isToday()) {
    return (
      <Text>
        Ready at <b>{readyAtDayjs.format(timeFormat)}</b>
      </Text>
    );
  } else if (readyAtDayjs.isTomorrow()) {
    return (
      <Text>
        Ready at <b>{readyAtDayjs.format(timeFormat)} tomorrow</b>
      </Text>
    );
  } else {
    // For datetimes in the past or far in the future, just append the date
    return (
      <Text>
        Ready at{' '}
        <b>
          {readyAtDayjs.format(timeFormat)}, {readyAtDayjs.format('MMM D')}
        </b>
      </Text>
    );
  }
};

interface PatientDesiredReadyByProps {
  readyBy: string;
  readyByTime: string;
}
const PatientDesiredReadyBy = ({ readyBy, readyByTime }: PatientDesiredReadyByProps) => {
  const timezone = dayjs.tz.guess();
  const readyByTimeDayJs = dayjs.utc(readyByTime).tz(timezone);
  const isToday = readyByTimeDayJs.isToday();
  const isTomorrow = readyByTimeDayJs.isTomorrow();

  if (readyBy === 'Urgent') {
    return (
      <Text>
        Need order <b>as soon as possible</b>
      </Text>
    );
  } else if (readyBy === 'After hours') {
    if (isToday) {
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

    if (isToday) {
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
            {hour} {period} tomorrow
          </b>
        </Text>
      );
    } else {
      // Requested time is in the past, this would happen if we don't get around to confirming it
      return (
        <Text>
          Need order by{' '}
          <b>
            {hour} {period}, {readyByTimeDayJs.format('MMM D')}
          </b>
        </Text>
      );
    }
  }
};
