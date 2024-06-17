import dayjs from 'dayjs';
import { Text } from '@chakra-ui/react';

const ReadyText = ({ readyBy, readyByDay, isDeliveryPharmacy, fulfillment }: any) => {
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
  console.log(fulfillment.state);
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

const ReadyAt = ({ pharmacyEstimatedReadyAt }: any) => {
  let readyAt = dayjs(pharmacyEstimatedReadyAt);

  // Round up to the nearest 15-minute increment
  const minutes = readyAt.minute();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  if (roundedMinutes >= 60) {
    readyAt = readyAt.add(1, 'hour').minute(0);
  } else {
    readyAt = readyAt.minute(roundedMinutes);
  }

  const isToday = readyAt.isSame(dayjs(), 'day');
  const isTomorrow = readyAt.isSame(dayjs().add(1, 'day'), 'day');
  const timeFormat = readyAt.minute() ? 'h:mm a' : 'h a';
  const dayPrefix = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : readyAt.format('dddd');

  return (
    <Text>
      Ready{' '}
      <b>
        {dayPrefix} at {readyAt.format(timeFormat)}
      </b>
    </Text>
  );
};

const ReadyBy = ({ readyBy, readyByDay }: any) => {
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
