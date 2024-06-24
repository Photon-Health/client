import dayjs, { Dayjs } from 'dayjs';
import { Text } from '@chakra-ui/react';
import { OrderFulfillment } from 'packages/sdk/dist/types';

export type Maybe<T> = T | null;
interface ReadyTextProps {
  readyBy?: string;
  readyByDay?: string;
  isDeliveryPharmacy?: boolean;
  fulfillment?: Maybe<OrderFulfillment> | undefined;
}
const ReadyText = ({ readyBy, readyByDay, isDeliveryPharmacy, fulfillment }: ReadyTextProps) => {
  const neededBy =
    readyBy && readyByDay ? <ReadyBy readyBy={readyBy} readyByDay={readyByDay} /> : null;
  const showNeededBy =
    neededBy &&
    !isDeliveryPharmacy &&
    (!fulfillment || // No fulfillment means user came from pharmacy selection
      fulfillment?.state === 'SENT');

  const estimatedReadyAt = fulfillment?.pharmacyEstimatedReadyAt ? (
    <ReadyAt pharmacyEstimatedReadyAt={fulfillment.pharmacyEstimatedReadyAt} />
  ) : null;
  const showEstimatedReadyAt =
    estimatedReadyAt &&
    !isDeliveryPharmacy &&
    (!fulfillment || // No fulfillment means user came from pharmacy selection
      fulfillment?.state === 'RECEIVED');

  return (
    <>
      {showNeededBy && neededBy}
      {showEstimatedReadyAt && estimatedReadyAt}
    </>
  );
};

const roundUpTo15MinInterval = (pharmacyEstimatedReadyAt: Date): Dayjs => {
  const dayJS = dayjs(pharmacyEstimatedReadyAt);
  const minutes = dayJS.minute();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  if (roundedMinutes >= 60) {
    return dayJS.add(1, 'hour').minute(0);
  } else {
    return dayJS.minute(roundedMinutes);
  }
};

interface ReadyAtProps {
  pharmacyEstimatedReadyAt: Date;
}
const ReadyAt = ({ pharmacyEstimatedReadyAt }: ReadyAtProps) => {
  const readyAt = roundUpTo15MinInterval(pharmacyEstimatedReadyAt);
  const isTomorrow = readyAt.isSame(dayjs().add(1, 'day'), 'day');
  const timeFormat = readyAt.minute() ? 'h:mm a' : 'h a';

  return (
    <Text>
      Ready{' '}
      {isTomorrow ? (
        <b>Tomorrow at {readyAt.format(timeFormat)}</b>
      ) : (
        <>
          at <b>{readyAt.format(timeFormat)}</b>
        </>
      )}
    </Text>
  );
};

interface ReadyByProps {
  readyBy: string;
  readyByDay: string;
}
const ReadyBy = ({ readyBy, readyByDay }: ReadyByProps) => {
  if (readyBy === 'Urgent') {
    return (
      <Text>
        Need order <b>as soon as possible</b>
      </Text>
    );
  } else if (readyBy === 'After hours') {
    return readyByDay === 'Today' ? (
      <Text>
        Need order <b>this evening</b>
      </Text>
    ) : (
      <Text>
        Need order <b>tomorrow evening</b>
      </Text>
    );
  } else {
    const [time, period] = readyBy.split(' ');
    const [hour] = time.split(':');
    return (
      <Text>
        Need order by{' '}
        <b>
          {hour} {period}
          {readyByDay === 'Tomorrow' ? ' tomorrow' : ''}
        </b>
      </Text>
    );
  }
};

export default ReadyText;
