import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import React from 'react';
import { CiShop } from 'react-icons/ci';
import { FiPackage } from 'react-icons/fi';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { roundUpTo15MinInterval } from '../../utils/dates';
import { Step } from './Step';

export interface OrderStatusHeaderProps {
  status: 'DELAYED' | 'PLACED' | 'RECEIVED' | 'PROCESSING' | 'READY' | 'PICKED_UP';
  exception?:
    | 'BACKORDERED'
    | 'OOS'
    | 'PA_REQUIRED'
    | 'PHARMACY_CLOSED'
    | 'PHARMACY_UNREACHABLE'
    | 'ORDER_ERROR';
  pharmacyEstimatedReadyAt?: Date;
  patientDesiredReadyAt?: Date | 'URGENT';
}

function headerText(status: OrderStatusHeaderProps['status']) {
  switch (status) {
    case 'DELAYED':
      return 'Order delayed';
    case 'PROCESSING':
    case 'RECEIVED':
      return 'Preparing order...';
    case 'PICKED_UP':
      return 'Order complete';
    case 'PLACED':
      return 'Order placed';
    case 'READY':
      return 'Your order is ready';
  }
}

function subheaderText(props: OrderStatusHeaderProps) {
  if (props.status === 'PLACED') {
    return "We're confirming your order with the pharmacy.";
  }
  if (props.status === 'PICKED_UP' || props.status === 'READY') {
    return null;
  }
  if (
    props.exception === 'BACKORDERED' ||
    props.exception === 'OOS' ||
    props.exception === 'PA_REQUIRED'
  ) {
    return 'Please review your order for details.';
  }
  if (props.exception === 'PHARMACY_UNREACHABLE') {
    return "We're unable to get updates for your order.";
  }
  if (props.exception === 'PHARMACY_CLOSED') {
    return 'Your pharmacy is closed. You can change it if you need your order sooner.';
  }
  if (props.exception === 'ORDER_ERROR') {
    return 'We’re unable to send your prescription to your pharmacy. Please select a new pharmacy below.';
  }
  if (props.status === 'RECEIVED') {
    return 'Your pharmacy has received your order.';
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
  if (props.status === 'PICKED_UP' || props.status === 'READY') {
    return 3;
  }
  if (props.exception == null && (props.status === 'PROCESSING' || props.status === 'RECEIVED')) {
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

function patientDesiredReadyByText(readyByTime: Date | 'URGENT') {
  if (readyByTime === 'URGENT') {
    return 'As soon as possible';
  }
  const readyByTimeDayJs = dayjs(readyByTime);
  const isToday = readyByTimeDayJs.isToday();
  const isTomorrow = readyByTimeDayJs.isTomorrow();

  if (isToday) {
    return readyByTimeDayJs.format('h:mma');
  } else if (isTomorrow) {
    return `Tomorrow at ${readyByTimeDayJs.format('h:mma')}`;
  }
  return readyByTimeDayJs.format('MMM Do [at] h:mma');
}

export const OrderStatusHeader: React.FC<OrderStatusHeaderProps> = (
  props: OrderStatusHeaderProps
) => {
  const header = headerText(props.status);
  const subheader = subheaderText(props);
  const color = progressLevel(props);
  const progressBar = progress(props);
  const isReady = props.status === 'READY' || props.status === 'PICKED_UP';

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
    <VStack w="full" alignItems={'start'} spacing={4} maxW={'xl'}>
      <Heading as="h3" color={isReady ? 'blue.600' : undefined}>
        {header}
      </Heading>
      {subheader && (
        <Text as={props.status !== 'PROCESSING' ? 'b' : undefined} fontSize={'lg'}>
          {subheader}
        </Text>
      )}
      <HStack w="full">
        {firstBar}
        {secondBar}
        {thirdBar}
      </HStack>
      {props.status === 'PLACED' && props.patientDesiredReadyAt && (
        <Box
          borderWidth={1}
          borderRadius={16}
          borderColor={'#EAECF0'}
          shadow={'md'}
          p={3}
          w={'full'}
        >
          Requested Pickup:{' '}
          <Text as="b" paddingLeft={3}>
            {patientDesiredReadyByText('URGENT' ?? props.patientDesiredReadyAt)}
          </Text>
        </Box>
      )}
    </VStack>
  );
};
