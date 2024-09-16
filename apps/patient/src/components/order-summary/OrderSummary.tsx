import { Card } from '../Card';
import { Box, Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import React from 'react';

export interface ExceptionData {
  message?: string;
  exceptionType: 'OOS' | 'BACKORDERED' | 'PA_REQUIRED';
}

export interface FulfillmentData {
  rxName: string;
  exceptions: ExceptionData[];
  pharmacyEstimatedReadyAt?: Date | undefined;
  state: 'CREATED' | 'SENT' | 'RECEIVED' | 'PROCESSING' | 'READY' | 'PICKED_UP';
}

function groupFulfillments(fulfillments: FulfillmentData[]) {
  const derivedState = fulfillments.map((f) => ({
    ...f,
    derivedState:
      f.exceptions.length === 0
        ? f.state
        : f.pharmacyEstimatedReadyAt != null
          ? ('EXCEPTION_WITH_READY_TIME' as const)
          : ('EXCEPTION_NO_READY_TIME' as const)
  }));

  const groupedByDerivedState = groupBy(derivedState, 'derivedState') as {
    [state in (typeof derivedState)[number]['derivedState']]?: typeof derivedState;
  };

  return groupedByDerivedState;
}

function getLatestReadyTime(fulfillments: FulfillmentData[]) {
  return fulfillments.reduce(
    (time: Date | undefined, f) =>
      time == null || f.pharmacyEstimatedReadyAt == null
        ? undefined
        : f.pharmacyEstimatedReadyAt > time
          ? f.pharmacyEstimatedReadyAt
          : time,
    fulfillments[0].pharmacyEstimatedReadyAt
  );
}

function formatReadyText(d: Date | undefined) {
  if (d == null) {
    return <Text as="i">No ready time</Text>;
  }

  if (d < new Date()) {
    return <Text>Should be ready</Text>;
  }

  const readyByTimeDayJs = dayjs(d);
  const isToday = readyByTimeDayJs.isToday();
  const isTomorrow = readyByTimeDayJs.isTomorrow();

  return (
    <Text as="b">
      Ready {isToday ? 'today' : isTomorrow ? 'tomorrow' : readyByTimeDayJs.format('MMM D')} at{' '}
      {readyByTimeDayJs.format('h:mma')}
    </Text>
  );
}

const MESSAGE: { [key in ExceptionData['exceptionType']]: string | undefined } = {
  OOS: 'Pharmacy does not have your medication in stock but is able to order it. Contact us if you need it sooner.',
  BACKORDERED:
    'The pharmacy can’t order the medication. Contact your provider for alternatives or locate a pharmacy that has it in stock and we will send it there.',
  PA_REQUIRED:
    'Your insurance needs information from your provider to cover this medication. Contact your provider for alternatives or pay the cash price.'
};

const ExceptionsBlock = ({ exception }: { exception: ExceptionData }) => {
  const exceptionName =
    exception.exceptionType === 'BACKORDERED'
      ? 'Backordered'
      : exception.exceptionType === 'OOS'
        ? 'Out of stock'
        : exception.exceptionType === 'PA_REQUIRED'
          ? 'Approval required'
          : undefined;
  return (
    <Box bg="orange.100" borderRadius={'xl'} p={3}>
      <Text as="b">{exceptionName}</Text>:{' '}
      {MESSAGE[exception.exceptionType] ?? exception.message ?? 'Let us know if you have an issue'}
    </Box>
  );
};

const FulfillmentBlock = ({ fulfillment }: { fulfillment: FulfillmentData }) => {
  return (
    <VStack w="full" alignItems={'stretch'}>
      <Text>{fulfillment.rxName}</Text>
      {fulfillment.exceptions.map((e) => (
        <ExceptionsBlock key={`${fulfillment.rxName}-${e.exceptionType}`} exception={e} />
      ))}
    </VStack>
  );
};

const BlockWithHeader = ({
  state,
  fulfillments
}: {
  state: 'Delayed' | 'Preparing' | 'Ready' | undefined;
  fulfillments: FulfillmentData[];
}) => {
  const readyAtText =
    state === 'Ready' ? undefined : formatReadyText(getLatestReadyTime(fulfillments));
  return (
    <VStack w="full" alignItems={'start'} spacing={3}>
      {state && (
        <HStack
          w="full"
          justifyContent={'space-between'}
          borderBottomWidth={1}
          borderBottomColor={'gray.200'}
          pb={2}
        >
          <Text as="b" textColor={state === 'Delayed' ? 'orange.500' : 'blue.500'}>
            {state}
          </Text>
          {readyAtText}
        </HStack>
      )}
      {fulfillments.map((f) => (
        <FulfillmentBlock key={`${state}-${readyAtText}-${f.rxName}`} fulfillment={f} />
      ))}
    </VStack>
  );
};

const FulfillmentsListContent = (props: { fulfillments: FulfillmentData[] }) => {
  if (props.fulfillments.some((f) => f.state === 'CREATED' || f.state === 'SENT')) {
    return <BlockWithHeader state={undefined} fulfillments={props.fulfillments} />;
  }
  const groups = groupFulfillments(props.fulfillments);
  const exceptionsWithReadyTimeBlock =
    (groups.EXCEPTION_WITH_READY_TIME ?? []).length > 0 ? (
      <BlockWithHeader state="Delayed" fulfillments={groups.EXCEPTION_WITH_READY_TIME ?? []} />
    ) : undefined;

  const exceptionsWithNoReadyTimeBlock =
    (groups.EXCEPTION_NO_READY_TIME ?? []).length > 0 ? (
      <BlockWithHeader state="Delayed" fulfillments={groups.EXCEPTION_NO_READY_TIME ?? []} />
    ) : undefined;

  const preparing = [...(groups.PROCESSING ?? []), ...(groups.RECEIVED ?? [])];
  const preparingBlock =
    preparing.length > 0 ? (
      <BlockWithHeader state="Preparing" fulfillments={preparing} />
    ) : undefined;

  const ready = [...(groups.READY ?? []), ...(groups.PICKED_UP ?? [])];
  const readyBlock =
    ready.length > 0 ? <BlockWithHeader state="Ready" fulfillments={ready} /> : undefined;

  return (
    <>
      {exceptionsWithNoReadyTimeBlock}
      {exceptionsWithReadyTimeBlock}
      {preparingBlock}
      {readyBlock}
    </>
  );
};

export const OrderSummary = (props: {
  fulfillments: FulfillmentData[];
  onViewDetails: () => void;
}) => {
  const header = (
    <HStack justifyContent={'space-between'} w={'full'} my={4}>
      <Heading as="h4" size="md">
        Order Details
      </Heading>
      <Button variant={'solid'} bg="gray.300" onClick={props.onViewDetails} size={'sm'}>
        View Details
      </Button>
    </HStack>
  );

  return (
    <VStack alignItems={'stretch'} w="full" px={4}>
      {header}
      <Card>
        <FulfillmentsListContent fulfillments={props.fulfillments} />
      </Card>
    </VStack>
  );
};
