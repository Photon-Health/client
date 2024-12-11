import { getSettings } from '@client/settings';
import { PrescriptionFulfillmentState } from '../../__generated__/graphql';
import { getLatestReadyTime } from '../../utils/fulfillmentsHelpers';
import { Order } from '../../utils/models';
import { useOrderContext } from '../../views/Main';
import { Card } from '../Card';
import { Box, Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';

export interface ExceptionData {
  message?: string;
  exceptionType:
    | 'OOS'
    | 'BACKORDERED'
    | 'PA_REQUIRED'
    | 'REFILL_TOO_SOON'
    | 'HIGH_COPAY'
    | 'NOT_COVERED';
}

export interface FulfillmentData {
  rxName: string;
  exceptions: ExceptionData[];
  pharmacyEstimatedReadyAt?: Date | undefined;
  state: PrescriptionFulfillmentState;
}

function exceptionCmp(e1: ExceptionData, e2: ExceptionData) {
  if (e1.exceptionType === 'PA_REQUIRED') return 1;
  if (e2.exceptionType === 'PA_REQUIRED') return -1;
  return e1.exceptionType.localeCompare(e2.exceptionType);
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

function formatReadyText(d: Date | undefined) {
  if (d == null) {
    return <Text as="i">No ready time available</Text>;
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

const MESSAGE: { [key in ExceptionData['exceptionType']]: (order: Order) => string } = {
  OOS: ({ isReroutable }) =>
    `Pharmacy does not have your medication in stock but is able to order it. ${
      isReroutable ? 'You can change your pharmacy below' : 'Contact us'
    } if you need it sooner.`,
  BACKORDERED: ({ isReroutable }) =>
    `The pharmacy can’t order the medication. Contact your provider for alternatives or ${
      isReroutable
        ? 'you can change your pharmacy below'
        : 'locate a pharmacy that has it in stock and we will send it there'
    }.`,
  PA_REQUIRED: ({ organization }) => {
    const { paExceptionMessage } = getSettings(organization.id);
    return (
      paExceptionMessage ??
      'Your insurance needs additional information from your provider before your pharmacy can fill your prescription. Please reach out to your provider directly to request a prior authorization or discuss alternative medications. If you’re paying cash, you can work directly with your pharmacy to pay the out-of-pocket price.'
    );
  },
  REFILL_TOO_SOON: () =>
    `Your insurance informed the pharmacy that it's too soon for a refill. You can wait, or you can pay cash or use a discount card if you need it sooner.`,
  NOT_COVERED: () =>
    `This prescription may not be covered by your insurance. You can still pay cash or use a discount card so you can get the medication you need. Your provider may also be able to help you find a covered alternative.`,
  HIGH_COPAY: () =>
    `This medication may have a high out of pocket cost. You may be able to use a discount card and pay significantly less.`
};

const TITLE: Partial<{ [key in ExceptionData['exceptionType']]: string }> = {
  BACKORDERED: 'Backordered',
  OOS: 'Out of stock',
  PA_REQUIRED: 'Approval required',
  REFILL_TOO_SOON: 'Refill too soon',
  HIGH_COPAY: 'High cost alert',
  NOT_COVERED: 'Not covered by insurance'
};

const ExceptionsBlock = ({ exception }: { exception: ExceptionData }) => {
  const exceptionName = TITLE[exception.exceptionType];
  const { order } = useOrderContext();
  return (
    <Box bg="orange.100" borderRadius={'xl'} p={3}>
      <Text as="b">{exceptionName}</Text>:{' '}
      {MESSAGE[exception.exceptionType](order) ??
        exception.message ??
        'Let us know if you have an issue'}
    </Box>
  );
};

const FulfillmentBlock = ({ fulfillment }: { fulfillment: FulfillmentData }) => {
  return (
    <VStack w="full" alignItems={'stretch'}>
      <Text>{fulfillment.rxName}</Text>
      {fulfillment.exceptions.sort(exceptionCmp).map((e) => (
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
          <Text as="b" textColor={state === 'Delayed' ? 'orange.400' : 'blue.500'}>
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
    <HStack justifyContent="space-between" w="full" my={4}>
      <Heading as="h4" size="md">
        Order Details
      </Heading>
      <Button variant="solid" bg="gray.300" onClick={props.onViewDetails} size="sm">
        View Details
      </Button>
    </HStack>
  );

  return (
    <VStack alignItems="stretch" w="full">
      {header}
      <Card>
        <FulfillmentsListContent fulfillments={props.fulfillments} />
      </Card>
    </VStack>
  );
};
