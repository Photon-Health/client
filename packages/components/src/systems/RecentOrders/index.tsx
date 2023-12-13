import { createContext, JSXElement, useContext, createEffect } from 'solid-js';
import { gql } from '@apollo/client';
import RecentOrdersCard from './RecentOrdersCard';
import { usePhotonClient } from '../SDKProvider';
import { Fill, Order } from '@photonhealth/sdk/dist/types';
import { createStore } from 'solid-js/store';
import RecentOrdersDuplicateDialog from './RecentOrdersDuplicateDialog';
import RecentOrdersIssueDialog from './RecentOrdersIssueDialog';
import RecentOrdersCombineDialog from './RecentOrdersCombineDialog';
import type { DraftPrescription } from '../DraftPrescriptions';

const GetPatientOrdersQuery = gql`
  query GetPatientOrders($patientId: ID!) {
    patient(id: $patientId) {
      id
      name {
        full
      }
      orders(first: 5) {
        id
        createdAt
        state
        fills {
          treatment {
            name
          }
          prescription {
            dispenseQuantity
            dispenseUnit
            fillsAllowed
            instructions
          }
        }
      }
    }
  }
`;

type RecentOrdersState = {
  orders: Order[];
  isCombineDialogOpen: boolean;
  isDuplicateDialogOpen: boolean;
  isIssueDialogOpen: boolean;
  patientName?: string;
  tmpDraftPrescription?: DraftPrescription;
  draftPrescriptions?: DraftPrescription[];
  // if the user clicks "continue" on the duplicate dialog, we need to call the callback to add to draft prescriptions
  duplicateDialogContinueCb?: () => void;
  // reference for the order that the user clicked
  orderWithIssue?: Order;
  // reference for the fill with a duplicate treatment name
  duplicateFill?: Fill;
};

type RecentOrdersActions = {
  setIsCombineDialogOpen: (isOpen: boolean) => void;
  setIsDuplicateDialogOpen: (
    isOpen: boolean,
    duplicateFill?: Fill,
    continueCb?: () => void
  ) => void;
  setIsIssueDialogOpen: (isOpen: boolean, orderWithIssue?: Order) => void;
  checkDuplicateFill: (treatmentName: string) => Fill | undefined;
  hasRoutingOrder: () => boolean;
};

type RecentOrdersContextValue = [RecentOrdersState, RecentOrdersActions];

const RecentOrdersContext = createContext<RecentOrdersContextValue>([
  {
    orders: [],
    isCombineDialogOpen: false,
    isDuplicateDialogOpen: false,
    isIssueDialogOpen: false
  },
  {
    setIsCombineDialogOpen: () => undefined,
    setIsDuplicateDialogOpen: () => undefined,
    setIsIssueDialogOpen: () => undefined,
    checkDuplicateFill: () => undefined,
    hasRoutingOrder: () => false
  }
]);

interface SDKProviderProps {
  patientId: string;
  children: JSXElement;
}

function RecentOrders(props: SDKProviderProps) {
  const client = usePhotonClient();
  const [state, setState] = createStore<RecentOrdersState>({
    orders: [],
    isCombineDialogOpen: false,
    isDuplicateDialogOpen: false,
    isIssueDialogOpen: false,
    duplicateDialogContinueCb: () => undefined
  });

  const value: RecentOrdersContextValue = [
    state,
    {
      setIsCombineDialogOpen(isOpen: boolean) {
        setState('isCombineDialogOpen', isOpen);
      },
      setIsDuplicateDialogOpen(isOpen, duplicateFill, continueCb) {
        setState({
          isDuplicateDialogOpen: isOpen,
          ...(continueCb && { duplicateDialogContinueCb: continueCb }),
          ...(duplicateFill && { duplicateFill })
        });
      },
      setIsIssueDialogOpen(isOpen, orderWithIssue) {
        setState({
          isIssueDialogOpen: isOpen,
          ...(orderWithIssue && { orderWithIssue }),
          ...(!isOpen && { duplicateFill: undefined, orderWithIssue: undefined })
        });
      },
      checkDuplicateFill(treatmentName) {
        return state.orders
          .map((order) => order.fills.find((fill) => fill.treatment.name === treatmentName))
          .find((fill) => fill !== undefined);
      },
      hasRoutingOrder() {
        return state.orders.some((order) => order.state === 'ROUTING');
      }
    }
  ];

  async function fetchPatientAndOrders() {
    const { data } = await client!.apollo.query({
      query: GetPatientOrdersQuery,
      variables: {
        patientId: props.patientId
      }
    });

    const orders = data?.patient?.orders;

    if (orders?.length > 0) {
      const now = new Date();
      const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

      const recentOrders = orders.filter((order: Order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt > eightHoursAgo;
      });

      setState({ orders: recentOrders, patientName: data?.patient?.name?.full });
    }
  }

  createEffect(() => {
    if (props.patientId) {
      fetchPatientAndOrders();
    }
  });

  return (
    <RecentOrdersContext.Provider value={value}>{props.children}</RecentOrdersContext.Provider>
  );
}

export function useRecentOrders() {
  return useContext(RecentOrdersContext);
}

RecentOrders.Card = RecentOrdersCard;
RecentOrders.CombineDialog = RecentOrdersCombineDialog;
RecentOrders.DuplicateDialog = RecentOrdersDuplicateDialog;
RecentOrders.IssueDialog = RecentOrdersIssueDialog;

export default RecentOrders;
