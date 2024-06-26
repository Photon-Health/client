import dayjs, { Dayjs } from 'dayjs';
import { Text } from '@chakra-ui/react';
import { OrderFulfillment } from 'packages/sdk/dist/types';
import isTomorrow from 'dayjs/plugin/isTomorrow';

dayjs.extend(isTomorrow);

export type Maybe<T> = T | null;
interface ReadyTextProps {
  readyBy?: string;
  readyByDay?: string;
  isDeliveryPharmacy?: boolean;
  fulfillment?: Maybe<OrderFulfillment> | undefined;
}
export const ReadyText = ({
  readyBy,
  readyByDay,
  isDeliveryPharmacy,
  fulfillment
}: ReadyTextProps) => {
  if (isDeliveryPharmacy) return null;

  // No fulfillment means user came from pharmacy selection
  if ((!fulfillment || fulfillment?.state === 'SENT') && readyBy && readyByDay) {
    return <PatientDesiredReadyBy readyBy={readyBy} readyByDay={readyByDay} />;
  }

  if (fulfillment?.state === 'RECEIVED' && fulfillment?.pharmacyEstimatedReadyAt) {
    return (
      <PharmacyEstimatedReadyAt pharmacyEstimatedReadyAt={fulfillment.pharmacyEstimatedReadyAt} />
    );
  }
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
