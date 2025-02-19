import { Heading, HStack, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import React from 'react';
import { CiShop } from 'react-icons/ci';
import { FiPackage } from 'react-icons/fi';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { roundUpTo15MinInterval } from '../../utils/dates';
import { Step } from './Step';
import { PrescriptionFulfillment } from '../../__generated__/graphql';

export interface OrderStatusHeaderProps {
  status: PrescriptionFulfillment['state'] | 'DELAYED' | 'FILLING' | 'SHIPPED';
  exception?:
    | 'BACKORDERED'
    | 'OOS'
    | 'PA_REQUIRED'
    | 'REFILL_TOO_SOON'
    | 'HIGH_COPAY'
    | 'NOT_COVERED'
    | 'PHARMACY_CLOSED'
    | 'PHARMACY_UNREACHABLE'
    | 'ORDER_ERROR'
    | 'RX_CLARIFICATION'
    | 'OTC'
    | 'MEDICAL_DEVICE'
    | 'DEMOGRAPHIC_MISMATCH'
    | 'PHARMACY_CLOSED'
    | 'PHARMACY_UNREACHABLE'
    | 'EXTERNAL_TRANSFER'
    | 'PHARMACY_NEEDS_INSURANCE_INFO'
    | 'PHARMACY_DOES_NOT_ACCEPT_INSURANCE';
  pharmacyEstimatedReadyAt?: Date;
  patientDesiredReadyAt?: Date | 'URGENT';
}

function headerText(props: OrderStatusHeaderProps) {
  const exception = props.exception;
  const status = props.status;
  if (exception) {
    switch (exception) {
      case 'DEMOGRAPHIC_MISMATCH':
        return 'Can’t process order';
      case 'PHARMACY_CLOSED':
      case 'PHARMACY_UNREACHABLE':
        return 'Order placed';
      case 'ORDER_ERROR':
        return 'Order error';
      case 'NOT_COVERED':
        return 'Order issue';
      case 'EXTERNAL_TRANSFER':
        return 'Order transferred';
      default:
        break;
    }
  }
  switch (status) {
    case 'DELAYED':
      return 'Order delayed';
    case 'PROCESSING':
    case 'RECEIVED':
    case 'FILLING':
      return 'Preparing order...';
    case 'PICKED_UP':
      return 'Order complete';
    case 'CREATED':
    case 'SENT':
      return 'Order placed';
    case 'READY':
      return 'Order is likely ready';
    case 'DELIVERED':
      return 'Order delivered';
    case 'SHIPPED':
      return 'Order in transit';
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _: never = status;
      return '';
    }
  }
}

function subheaderText(props: OrderStatusHeaderProps) {
  // Exceptions take precedence
  if (
    props.exception === 'BACKORDERED' ||
    props.exception === 'OOS' ||
    props.exception === 'PA_REQUIRED' ||
    props.exception === 'REFILL_TOO_SOON' ||
    props.exception === 'RX_CLARIFICATION' ||
    props.exception === 'OTC' ||
    props.exception === 'MEDICAL_DEVICE'
  ) {
    return 'Please review your order for details.';
  }
  if (props.exception === 'PHARMACY_UNREACHABLE') {
    return "We're unable to get updates for your order. You can call your current pharmacy or change pharmacies below.";
  }
  if (props.exception === 'PHARMACY_CLOSED') {
    return 'Your pharmacy is closed. You can change it if you need your order sooner.';
  }
  if (props.exception === 'ORDER_ERROR') {
    return 'Unable to send to pharmacy. Please select a new pharmacy below.';
  }
  if (props.exception === 'DEMOGRAPHIC_MISMATCH') {
    return 'Please reach out to your provider with correct Legal Name / DoB / Address to write you a new prescription.';
  }
  if (props.exception === 'EXTERNAL_TRANSFER') {
    return 'Please contact your original pharmacy if you have questions.';
  }

  // Then just check the status
  if (props.status === 'CREATED' || props.status === 'SENT') {
    return "We're confirming your order with the pharmacy.";
  }
  if (props.status === 'READY') {
    return 'Our estimate is based on the time the pharmacy provided';
  }
  if (props.status === 'PICKED_UP') {
    return null;
  }
  if (props.status === 'FILLING') {
    return 'The pharmacy is preparing your order for delivery.';
  }
  if (props.status === 'SHIPPED') {
    return 'Your order is out for delivery';
  }
  if (props.status === 'RECEIVED') {
    return 'Your pharmacy has received your order. We weren’t able to get a ready time.';
  }
  if (props.status === 'PROCESSING') {
    if (props.pharmacyEstimatedReadyAt) {
      return <PharmacyEstimatedReadyAt pharmacyEstimatedReadyAt={props.pharmacyEstimatedReadyAt} />;
    } else {
      return null;
    }
  }
  if (props.status === 'DELAYED') {
    if (props.pharmacyEstimatedReadyAt) {
      return <PharmacyEstimatedReadyAt pharmacyEstimatedReadyAt={props.pharmacyEstimatedReadyAt} />;
    }
    return 'Please review your order for details.';
  }
}

function progressLevel(props: OrderStatusHeaderProps) {
  if (props.exception === 'ORDER_ERROR') {
    return 'danger';
  }
  if (props.exception != null) {
    return 'warning';
  }
  return 'primary';
}

function progress(props: OrderStatusHeaderProps) {
  if (props.status === 'PICKED_UP' || props.status === 'READY' || props.status === 'DELIVERED') {
    return 3;
  }
  if (
    props.exception == null &&
    (props.status === 'PROCESSING' ||
      props.status === 'RECEIVED' ||
      props.status === 'FILLING' ||
      props.status === 'SHIPPED')
  ) {
    return 2;
  }
  return 1;
}

interface PharmacyEstimatedReadyAtProps {
  pharmacyEstimatedReadyAt: Date;
}
const PharmacyEstimatedReadyAt = ({ pharmacyEstimatedReadyAt }: PharmacyEstimatedReadyAtProps) => {
  const rounded = roundUpTo15MinInterval(pharmacyEstimatedReadyAt);
  const readyAtDayjs = dayjs(rounded);
  const timeFormat = readyAtDayjs.minute() ? 'h:mm a' : 'h a';
  const now = dayjs();
  const isPast = now.isAfter(readyAtDayjs);

  if (isPast) {
    return <Text>Your prescriptions should be ready</Text>;
  }
  if (readyAtDayjs.isToday()) {
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

function patientDesiredReadyByText(readyByTime: Date | 'URGENT') {
  if (readyByTime === 'URGENT') {
    return 'As soon as possible';
  }
  const readyByTimeDayJs = dayjs(readyByTime);
  const isToday = readyByTimeDayJs.isToday();
  const isTomorrow = readyByTimeDayJs.isTomorrow();

  if (isToday) {
    return readyByTimeDayJs.format('h:mm a');
  } else if (isTomorrow) {
    return `Tomorrow at ${readyByTimeDayJs.format('h:mm a')}`;
  }
  return readyByTimeDayJs.format('MMM D [at] h:mm a');
}

export const OrderStatusHeader: React.FC<OrderStatusHeaderProps> = (
  props: OrderStatusHeaderProps
) => {
  const isReady =
    props.status === 'READY' ||
    props.status === 'PICKED_UP' ||
    (props.status === 'PROCESSING' &&
      props.pharmacyEstimatedReadyAt &&
      props.pharmacyEstimatedReadyAt < new Date());

  const derivedStatus = isReady && props.status === 'PROCESSING' ? 'READY' : props.status;

  const derivedProps = { ...props, status: derivedStatus };

  const header = headerText(derivedProps);
  const subheader = subheaderText(derivedProps);
  const color = progressLevel(derivedProps);
  const progressBar = progress(derivedProps);

  const firstBar = (
    <Step
      icon={IoDocumentTextOutline}
      color={color}
      complete={progressBar >= 1}
      iconProps={{ strokeWidth: 2 }}
    />
  );
  const secondBar = <Step icon={FiPackage} color={color} complete={progressBar >= 2} />;
  const thirdBar = (
    <Step icon={CiShop} color={color} complete={progressBar >= 3} iconProps={{ strokeWidth: 1 }} />
  );

  return (
    <VStack w="full" alignItems={'start'} spacing={4}>
      <Heading as="h3">{header}</Heading>
      {subheader && (
        <Text fontWeight="semibold" fontSize="lg" color="gray.600">
          {subheader}
        </Text>
      )}
      <HStack w="full">
        {firstBar}
        {secondBar}
        {thirdBar}
      </HStack>
      {(props.status === 'CREATED' || props.status === 'SENT') && props.patientDesiredReadyAt && (
        <HStack
          borderWidth={1}
          borderRadius="xl"
          borderColor="#EAECF0"
          shadow="md"
          p={4}
          w="full"
          justify="space-between"
        >
          <Text>Requested Pickup:</Text>
          <Text as="b">{patientDesiredReadyByText(props.patientDesiredReadyAt)}</Text>
        </HStack>
      )}
    </VStack>
  );
};
