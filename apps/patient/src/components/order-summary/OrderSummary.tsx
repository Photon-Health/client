import { Card } from '../Card';
import { Box, Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import React from 'react';

export interface ExceptionData {
  message: string;
  type: 'OOS' | 'BACKORDERED' | 'PA_REQUIRED';
}

export interface FulfillmentData {
  rxName: string;
  exceptions: ExceptionData[];
  pharmacyEstimatedReadyTime: Date | undefined;
  state: 'CREATED' | 'SENT' | 'RECEIVED' | 'PROCESSING' | 'READY' | 'PICKED_UP';
}

function groupFulfillments(fulfillments: FulfillmentData[]) {
  const derivedState = fulfillments.map((f) => ({
    ...f,
    derivedState:
      f.exceptions.length === 0
        ? f.state
        : f.pharmacyEstimatedReadyTime != null
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
      time == null || f.pharmacyEstimatedReadyTime == null
        ? undefined
        : f.pharmacyEstimatedReadyTime > time
        ? f.pharmacyEstimatedReadyTime
        : time,
    fulfillments[0].pharmacyEstimatedReadyTime
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

const ExceptionsBlock = ({ exception }: { exception: ExceptionData }) => {
  const exceptionName =
    exception.type === 'BACKORDERED'
      ? 'Backordered'
      : exception.type === 'OOS'
      ? 'Out of stock'
      : exception.type === 'PA_REQUIRED'
      ? 'Approval required'
      : undefined;
  return (
    <Box bg="orange.100" borderRadius={'xl'} p={3}>
      <Text as="b">{exceptionName}</Text>: {exception.message}
    </Box>
  );
};

const FulfillmentBlock = ({ fulfillment }: { fulfillment: FulfillmentData }) => {
  return (
    <VStack w="full" alignItems={'stretch'}>
      <Text>{fulfillment.rxName}</Text>
      {fulfillment.exceptions.map((e) => (
        <ExceptionsBlock key={`${fulfillment.rxName}-${e.type}`} exception={e} />
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
