import dayjs, { Dayjs } from 'dayjs';
import { Text } from '@chakra-ui/react';
import { OrderFulfillment, Maybe } from 'packages/sdk/dist/types';
import isTomorrow from 'dayjs/plugin/isTomorrow';

dayjs.extend(isTomorrow);

interface ReadyTextProps {
  readyBy?: string;
  readyByDay?: string;
  readyByTime?: string;
  isDeliveryPharmacy?: boolean;
  fulfillment?: Maybe<OrderFulfillment>;
}

export const ReadyText = ({
  readyBy,
  readyByDay,
  readyByTime,
  isDeliveryPharmacy,
  fulfillment
}: ReadyTextProps) => {
  if (isDeliveryPharmacy) return null;

  // No fulfillment means user came from pharmacy selection
  if ((!fulfillment || fulfillment?.state === 'SENT') && readyBy && readyByDay && readyByTime) {
    return (
      <PatientDesiredReadyBy readyBy={readyBy} readyByDay={readyByDay} readyByTime={readyByTime} />
    );
  }

  if (fulfillment?.state === 'RECEIVED' && fulfillment?.pharmacyEstimatedReadyAt) {
    return (
      <PharmacyEstimatedReadyAt pharmacyEstimatedReadyAt={fulfillment.pharmacyEstimatedReadyAt} />
    );
  }

  return null;
};

const roundUpTo15MinInterval = (pharmacyEstimatedReadyAt: Date): Dayjs => {
  const estimatedReadyAtAsDayJs = dayjs(pharmacyEstimatedReadyAt);
  const minutes = estimatedReadyAtAsDayJs.minute();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  if (roundedMinutes >= 60) {
    return estimatedReadyAtAsDayJs.add(1, 'hour').minute(0);
  } else {
    return estimatedReadyAtAsDayJs.minute(roundedMinutes);
  }
};

interface PharmacyEstimatedReadyAtProps {
  pharmacyEstimatedReadyAt: Date;
}
const PharmacyEstimatedReadyAt = ({ pharmacyEstimatedReadyAt }: PharmacyEstimatedReadyAtProps) => {
  const readyAt = roundUpTo15MinInterval(pharmacyEstimatedReadyAt);
  const isTomorrow = readyAt.add(1, 'day').isTomorrow();
  const timeFormat = readyAt.minute() ? 'h:mm a' : 'h a';

  return (
    <Text>
      Ready{isTomorrow ? <b> Tomorrow </b> : ' '} at <b>{readyAt.format(timeFormat)}</b>
    </Text>
  );
};

interface PatientDesiredReadyByProps {
  readyBy: string;
  readyByDay: string;
  readyByTime: string;
}
const PatientDesiredReadyBy = ({
  readyBy,
  readyByDay,
  readyByTime
}: PatientDesiredReadyByProps) => {
  const now = dayjs();
  const timezone = dayjs.tz.guess();
  const readyByTimeDayJs = dayjs.utc(readyByTime).tz(timezone);
  const isToday = readyByTimeDayJs.isToday();
  const isPast = now.isAfter(readyByTimeDayJs);

  if (readyBy === 'Urgent') {
    return (
      <Text>
        Need order <b>as soon as possible</b>
      </Text>
    );
  } else if (readyBy === 'After hours') {
    if (isPast) {
      // Let's not surface anything here until we decide on copy
      return null;
    } else if (isToday) {
      return (
        <Text>
          Need order <b>this evening</b>
        </Text>
      );
    } else {
      return (
        <Text>
          Need order <b>tomorrow evening</b>
        </Text>
      );
    }
  } else {
    const [time, period] = readyBy.split(' ');
    const [hour] = time.split(':');

    if (isPast) {
      return (
        <Text>
          Need order by <b>{readyByTimeDayJs.format('h:mm A on MMM D')}</b>
        </Text>
      );
    } else {
      const displayTomorrow = readyByDay === 'Tomorrow' && !isToday;
      return (
        <Text>
          Need order by{' '}
          <b>
            {hour} {period}
            {displayTomorrow ? ' tomorrow' : ''}
          </b>
        </Text>
      );
    }
  }
};
