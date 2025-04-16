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
    | 'NOT_COVERED'
    | 'RX_CLARIFICATION'
    | 'OTC'
    | 'MEDICAL_DEVICE';
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
  BACKORDERED: () =>
    `The pharmacy can’t order the medication. Contact your provider for alternatives or change your pharmacy.`,
  PA_REQUIRED: ({ organization }) => {
    const paExceptionMessage = organization.settings?.priorAuthorizationExceptionMessage;
    return (
      paExceptionMessage ??
      'Your insurance needs information from your provider to cover this medication. Contact your provider for alternatives or pay the cash price.'
    );
  },
  REFILL_TOO_SOON: () =>
    `Your insurance informed the pharmacy that it's too soon for a refill. You can wait, or you can pay cash or use a discount card if you need it sooner.`,
  NOT_COVERED: () =>
    `This prescription may not be covered by your insurance. You can still pay cash or use a discount card. Your provider may also be able to help you find a covered alternative.`,
  HIGH_COPAY: () =>
    `This medication may have a high out of pocket cost. You may be able to use a discount card and pay significantly less.`,
  RX_CLARIFICATION: () =>
    `Your pharmacy needs to speak with your provider before they can fill your prescription. We’ve reached out to them.`,
  OTC: () =>
    `Your pharmacy has informed us that the medication you were prescribed is available over the counter and can be picked up from the relevant aisle at your local pharmacy.`,
  MEDICAL_DEVICE: () =>
    `This pharmacy does not keep this device in stock and cannot fill your prescription. This product is available without a prescription at a medical supply or online store.`
};

const TITLE: Partial<{ [key in ExceptionData['exceptionType']]: string }> = {
  BACKORDERED: 'Backordered',
  OOS: 'Out of stock',
  PA_REQUIRED: 'Approval required',
  REFILL_TOO_SOON: 'Refill too soon',
  HIGH_COPAY: 'High cost alert',
  NOT_COVERED: 'Not covered by insurance',
  RX_CLARIFICATION: 'Needs Clarification',
  OTC: 'Over the Counter',
  MEDICAL_DEVICE: 'Medical Device'
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
      <Text data-dd-privacy="mask">{fulfillment.rxName}</Text>
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
    <HStack justifyContent="space-between" w="full">
      <Heading as="h4" size="md">
        Order Summary
      </Heading>
      <Button variant="solid" bg="gray.300" onClick={props.onViewDetails} size="sm">
        View Details
      </Button>
    </HStack>
  );

  return (
    <VStack alignItems="stretch" w="full" spacing={4}>
      {header}
      <Card>
        <FulfillmentsListContent fulfillments={props.fulfillments} />
      </Card>
    </VStack>
  );
};
