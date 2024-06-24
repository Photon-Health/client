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
  const showPatientDesiredreadyBy =
    readyBy &&
    readyByDay &&
    !isDeliveryPharmacy &&
    (!fulfillment || // No fulfillment means user came from pharmacy selection
      fulfillment?.state === 'SENT');
  const showEstimatedReadyAt =
    fulfillment?.pharmacyEstimatedReadyAt &&
    !isDeliveryPharmacy &&
    (!fulfillment || // No fulfillment means user came from pharmacy selection
      fulfillment?.state === 'RECEIVED');

  return (
    <>
      {showPatientDesiredreadyBy && (
        <PatientDesiredReadyBy readyBy={readyBy} readyByDay={readyByDay} />
      )}
      {showEstimatedReadyAt && (
        <PharmacyEstimatedReadyAt pharmacyEstimatedReadyAt={fulfillment.pharmacyEstimatedReadyAt} />
      )}
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

interface PharmacyEstimatedReadyAtProps {
  pharmacyEstimatedReadyAt: Date;
}
const PharmacyEstimatedReadyAt = ({ pharmacyEstimatedReadyAt }: PharmacyEstimatedReadyAtProps) => {
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

interface PatientDesiredReadyByProps {
  readyBy: string;
  readyByDay: string;
}
const PatientDesiredReadyBy = ({ readyBy, readyByDay }: PatientDesiredReadyByProps) => {
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
