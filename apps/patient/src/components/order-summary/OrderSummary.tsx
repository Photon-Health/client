import { PrescriptionFulfillmentState } from '../../__generated__/graphql';
import { getLatestReadyTime } from '../../utils/fulfillmentsHelpers';
import { Order } from '../../utils/models';
import { useOrderContext } from '../../views/Main';
import { Card } from '../Card';
import { Box, Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import { useText } from '../../hooks/useText';

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

const ExceptionsBlock = ({ exception }: { exception: ExceptionData }) => {
  const { order } = useOrderContext();
  const t = useText();
  const exceptionName = t.exTitle[exception.exceptionType];

  const getMessage = () => {
    const { isReroutable, organization } = order;
    switch (exception.exceptionType) {
      case 'OOS':
        return t.exMsg.OOS(!!isReroutable);
      case 'BACKORDERED':
        return t.exMsg.BACKORDERED();
      case 'PA_REQUIRED':
        return t.exMsg.PA_REQUIRED(
          organization.settings?.priorAuthorizationExceptionMessage
        );
      case 'REFILL_TOO_SOON':
        return t.exMsg.REFILL_TOO_SOON();
      case 'NOT_COVERED':
        return t.exMsg.NOT_COVERED();
      case 'HIGH_COPAY':
        return t.exMsg.HIGH_COPAY();
      case 'RX_CLARIFICATION':
        return t.exMsg.RX_CLARIFICATION();
      case 'OTC':
        return t.exMsg.OTC();
      case 'MEDICAL_DEVICE':
        return t.exMsg.MEDICAL_DEVICE();
      default:
        return exception.message ?? t.letUsKnow;
    }
  };

  return (
    <Box bg="orange.100" borderRadius={'xl'} p={3}>
      <Text as="b">{exceptionName}</Text>: {getMessage()}
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
  const t = useText();

  const getStateLabel = () => {
    if (state === 'Delayed') return t.stateDelayed;
    if (state === 'Preparing') return t.statePreparing;
    if (state === 'Ready') return t.stateReady;
    return undefined;
  };

  const formatReadyText = (d: Date | undefined) => {
    if (d == null) {
      return <Text as="i">{t.noReadyTime}</Text>;
    }
    if (d < new Date()) {
      return <Text>{t.shouldBeReady}</Text>;
    }
    const readyByTimeDayJs = dayjs(d);
    const isToday = readyByTimeDayJs.isToday();
    const isTomorrow = readyByTimeDayJs.isTomorrow();
    return (
      <Text as="b">
        {t.readyPrefix} {isToday ? t.readyToday : isTomorrow ? t.readyTomorrow : readyByTimeDayJs.format('MMM D')}{' '}
        at {readyByTimeDayJs.format('h:mma')}
      </Text>
    );
  };

  const stateLabel = getStateLabel();
  const readyAtText = state === 'Ready' ? undefined : formatReadyText(getLatestReadyTime(fulfillments));

  return (
    <VStack w="full" alignItems={'start'} spacing={3}>
      {stateLabel && (
        <HStack
          w="full"
          justifyContent={'space-between'}
          borderBottomWidth={1}
          borderBottomColor={'gray.200'}
          pb={2}
        >
          <Text as="b" textColor={state === 'Delayed' ? 'orange.400' : 'blue.500'}>
            {stateLabel}
          </Text>
          {readyAtText}
        </HStack>
      )}
      {fulfillments.map((f) => (
        <FulfillmentBlock key={`${stateLabel}-${f.rxName}`} fulfillment={f} />
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
  const t = useText();

  const header = (
    <HStack justifyContent="space-between" w="full">
      <Heading as="h4" size="md">
        {t.orderSummaryTitle}
      </Heading>
      <Button variant="solid" bg="gray.300" onClick={props.onViewDetails} size="sm">
        {t.viewDetails}
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
