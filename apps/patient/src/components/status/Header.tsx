import { Heading, HStack, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import React from 'react';
import { CiShop } from 'react-icons/ci';
import { FiPackage } from 'react-icons/fi';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { roundUpTo15MinInterval } from '../../utils/dates';
import { Step } from './Step';
import { FulfillmentType, PrescriptionFulfillment } from '../../__generated__/graphql';
import { useText } from '../../hooks/useText';

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
    | 'PHARMACY_DOES_NOT_ACCEPT_INSURANCE'
    | 'DOCTOR_NOT_LICENSED_IN_STATE'
    | 'SUPERVISING_PHYSICIAN_NEEDED';
  pharmacyEstimatedReadyAt?: Date;
  patientDesiredReadyAt?: Date | 'URGENT';
  fulfillmentType?: FulfillmentType;
  integrated?: boolean;
  subHeaderOverride?: string;
}

type TText = ReturnType<typeof useText>;

function headerText(props: OrderStatusHeaderProps, t: TText) {
  const exception = props.exception;
  const status = props.status;
  if (exception) {
    switch (exception) {
      case 'DEMOGRAPHIC_MISMATCH':
        return t.headerCantProcess;
      case 'PHARMACY_CLOSED':
      case 'PHARMACY_UNREACHABLE':
        return t.headerOrderPlaced;
      case 'ORDER_ERROR':
        return t.headerOrderError;
      case 'NOT_COVERED':
        return t.headerOrderIssue;
      case 'EXTERNAL_TRANSFER':
        return t.headerOrderTransferred;
      case 'DOCTOR_NOT_LICENSED_IN_STATE':
        return t.headerOrderIssue;
      case 'SUPERVISING_PHYSICIAN_NEEDED':
        return t.headerOrderIssue;
      default:
        break;
    }
  }
  switch (status) {
    case 'DELAYED':
      return t.headerOrderDelayed;
    case 'PROCESSING':
    case 'RECEIVED':
    case 'FILLING':
      return t.headerPreparingOrder;
    case 'PICKED_UP':
      return t.headerOrderComplete;
    case 'CREATED':
    case 'SENT':
      return t.headerOrderPlaced;
    case 'READY':
      return t.headerOrderLikelyReady;
    case 'DELIVERED':
      return t.headerOrderDelivered;
    case 'SHIPPED':
      return t.headerOrderInTransit;
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _: never = status;
      return '';
    }
  }
}

function subheaderText(
  props: OrderStatusHeaderProps,
  t: TText,
  pharmacyEstimatedReadyAtComponent: React.ReactNode
) {
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
    return t.subPleaseReview;
  }
  if (props.exception === 'PHARMACY_UNREACHABLE') {
    return t.subPharmacyUnreachable;
  }
  if (props.exception === 'PHARMACY_CLOSED') {
    return t.subPharmacyClosed;
  }
  if (props.exception === 'ORDER_ERROR') {
    return t.subOrderError;
  }
  if (props.exception === 'DEMOGRAPHIC_MISMATCH') {
    return t.subDemographicMismatch;
  }
  if (props.exception === 'EXTERNAL_TRANSFER') {
    return t.subExternalTransfer;
  }
  if (props.exception === 'DOCTOR_NOT_LICENSED_IN_STATE') {
    return t.subDoctorNotLicensed;
  }
  if (props.exception === 'SUPERVISING_PHYSICIAN_NEEDED') {
    return t.subDoctorNotLicensed;
  }

  // Then just check the status
  if (
    (props.fulfillmentType === 'MAIL_ORDER' || props.integrated) &&
    ['CREATED', 'SENT', 'RECEIVED'].includes(props.status)
  ) {
    return t.subMailOrderSent;
  }
  if (props.status === 'CREATED' || props.status === 'SENT') {
    return t.subConfirmingOrder;
  }
  if (props.status === 'READY') {
    return t.subEstimateReady;
  }
  if (props.status === 'PICKED_UP') {
    return null;
  }
  if (props.status === 'FILLING') {
    return t.preparingDelivery;
  }
  if (props.status === 'SHIPPED') {
    return t.subOutForDelivery;
  }
  if (props.status === 'RECEIVED') {
    return t.subPharmacyReceived;
  }
  if (props.status === 'PROCESSING') {
    if (props.pharmacyEstimatedReadyAt) {
      return pharmacyEstimatedReadyAtComponent;
    } else {
      return null;
    }
  }
  if (props.status === 'DELAYED') {
    if (props.pharmacyEstimatedReadyAt) {
      return pharmacyEstimatedReadyAtComponent;
    }
    return t.subPleaseReview;
  }
}

function progressLevel(props: OrderStatusHeaderProps) {
  if (props.exception === 'ORDER_ERROR' || props.exception === 'DEMOGRAPHIC_MISMATCH') {
    return 'danger';
  }
  if (
    props.exception != null &&
    props.exception !== 'PHARMACY_NEEDS_INSURANCE_INFO' &&
    props.exception !== 'PHARMACY_DOES_NOT_ACCEPT_INSURANCE'
  ) {
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
  const t = useText();
  const rounded = roundUpTo15MinInterval(pharmacyEstimatedReadyAt);
  const readyAtDayjs = dayjs(rounded);
  const timeFormat = readyAtDayjs.minute() ? 'h:mm a' : 'h a';
  const now = dayjs();
  const isPast = now.isAfter(readyAtDayjs);

  if (isPast) {
    return <Text>{t.subPrescriptionsReady}</Text>;
  }
  if (readyAtDayjs.isToday()) {
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

function patientDesiredReadyByText(readyByTime: Date | 'URGENT', t: TText) {
  if (readyByTime === 'URGENT') {
    return t.urgentReadyBy;
  }
  const readyByTimeDayJs = dayjs(readyByTime);
  const isToday = readyByTimeDayJs.isToday();
  const isTomorrow = readyByTimeDayJs.isTomorrow();

  if (isToday) {
    return readyByTimeDayJs.format('h:mm a');
  } else if (isTomorrow) {
    return `${t.tomorrowAtPrefix} ${readyByTimeDayJs.format('h:mm a')}`;
  }
  return readyByTimeDayJs.format('MMM D [at] h:mm a');
}

export const OrderStatusHeader: React.FC<OrderStatusHeaderProps> = (
  props: OrderStatusHeaderProps
) => {
  const t = useText();

  const isReady =
    props.status === 'READY' ||
    props.status === 'PICKED_UP' ||
    (props.status === 'PROCESSING' &&
      props.pharmacyEstimatedReadyAt &&
      props.pharmacyEstimatedReadyAt < new Date());

  const derivedStatus = isReady && props.status === 'PROCESSING' ? 'READY' : props.status;

  const derivedProps = { ...props, status: derivedStatus };

  const pharmacyEstimatedReadyAtNode = props.pharmacyEstimatedReadyAt ? (
    <PharmacyEstimatedReadyAt pharmacyEstimatedReadyAt={props.pharmacyEstimatedReadyAt} />
  ) : null;

  const header = headerText(derivedProps, t);
  const displayProgressBar = props.exception !== 'EXTERNAL_TRANSFER';
  const subheader =
    props.subHeaderOverride || subheaderText(derivedProps, t, pharmacyEstimatedReadyAtNode);
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
      {displayProgressBar && (
        <HStack w="full">
          {firstBar}
          {secondBar}
          {thirdBar}
        </HStack>
      )}
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
          <Text>{t.requestedPickup}</Text>
          <Text as="b">{patientDesiredReadyByText(props.patientDesiredReadyAt, t)}</Text>
        </HStack>
      )}
    </VStack>
  );
};
