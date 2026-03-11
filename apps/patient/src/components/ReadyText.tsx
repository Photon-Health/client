import dayjs from 'dayjs';
import { Text } from '@chakra-ui/react';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import { Maybe } from '../__generated__/graphql';
import { OrderFulfillment } from '../utils/models';
import { roundUpTo15MinInterval } from '../utils/dates';
import { useText } from '../hooks/useText';

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
  const t = useText();
  const rounded = roundUpTo15MinInterval(pharmacyEstimatedReadyAt);
  const readyAtDayjs = dayjs(rounded);
  const timeFormat = readyAtDayjs.minute() ? 'h:mm a' : 'h a';
  const now = dayjs();
  const isFuture = now.isBefore(readyAtDayjs);

  if (readyAtDayjs.isToday() && isFuture) {
    return (
      <Text>
        {t.readyAt} <b>{readyAtDayjs.format(timeFormat)}</b>
      </Text>
    );
  } else if (readyAtDayjs.isTomorrow()) {
    return (
      <Text>
        {t.readyPrefix}{' '}
        <b>
          {t.tomorrowAt} {readyAtDayjs.format(timeFormat)}
        </b>
      </Text>
    );
  } else {
    return (
      <Text>
        {t.readyPrefix}{' '}
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
  const t = useText();
  const readyByTimeDayJs = dayjs(readyByTime);
  const isToday = readyByTimeDayJs.isToday();
  const isTomorrow = readyByTimeDayJs.isTomorrow();
  const now = dayjs();
  const isFuture = now.isBefore(readyByTimeDayJs);

  if (readyBy === 'Urgent') {
    return (
      <Text>
        {t.needOrderPre} <b>{t.asap}</b>
      </Text>
    );
  } else if (readyBy === 'After hours') {
    if (isToday && isFuture) {
      return (
        <Text>
          {t.needOrderPre} <b>{t.thisEvening}</b>
        </Text>
      );
    } else if (isTomorrow) {
      return (
        <Text>
          {t.needOrderPre} <b>{t.tomorrowEvening}</b>
        </Text>
      );
    } else {
      return null;
    }
  } else {
    const [time, period] = readyBy.split(' ');
    const [hour] = time.split(':');

    if (isToday && isFuture) {
      return (
        <Text>
          {t.needOrderByPre}{' '}
          <b>
            {hour} {period}
          </b>
        </Text>
      );
    } else if (isTomorrow) {
      return (
        <Text>
          {t.needOrderByPre}{' '}
          <b>
            {t.tomorrowAt} {hour} {period}
          </b>
        </Text>
      );
    } else {
      return (
        <Text>
          {t.needOrderByPre}{' '}
          <b>
            {readyByTimeDayJs.format('ddd, MMM D')} at {hour} {period}
          </b>
        </Text>
      );
    }
  }
};
