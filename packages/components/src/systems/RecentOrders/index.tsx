import { createContext, JSXElement, useContext, createEffect } from 'solid-js';
import { gql } from '@apollo/client';
import RecentOrdersCard from './RecentOrdersCard';
import { usePhotonClient } from '../SDKProvider';
import { Order } from '@photonhealth/sdk/dist/types';
import { createStore } from 'solid-js/store';
import RecentOrdersCancelDialog from './RecentOrdersCancelDialog';
import RecentOrdersDuplicateDialog from './RecentOrdersDuplicateDialog';
import RecentOrdersIssueDialog from './RecentOrdersIssueDialog';

type RecentOrdersState = {
  orders: Order[];
  isCancelDialogOpen: boolean;
  isDuplicateDialogOpen: boolean;
  isIssueDialogOpen: boolean;
};

type RecentOrdersActions = {
  setIsCancelDialogOpen: (isOpen: boolean) => void;
  setIsDuplicateDialogOpen: (isOpen: boolean) => void;
  setIsIssueDialogOpen: (isOpen: boolean) => void;
};

type RecentOrdersContextValue = [RecentOrdersState, RecentOrdersActions];

const RecentOrdersContext = createContext<RecentOrdersContextValue>([
  { orders: [], isCancelDialogOpen: false, isDuplicateDialogOpen: false, isIssueDialogOpen: false },
  {
    setIsCancelDialogOpen: () => undefined,
    setIsDuplicateDialogOpen: () => undefined,
    setIsIssueDialogOpen: () => undefined
  }
]);

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
        }
      }
    }
  }
`;

interface SDKProviderProps {
  patientId: string;
  children: JSXElement;
}

function RecentOrders(props: SDKProviderProps) {
  const client = usePhotonClient();
  const [state, setState] = createStore<RecentOrdersState>({
    orders: [],
    isCancelDialogOpen: false,
    isDuplicateDialogOpen: false,
    isIssueDialogOpen: false
  });

  const value: RecentOrdersContextValue = [
    state,
    {
      setIsCancelDialogOpen(isOpen: boolean) {
        setState('isCancelDialogOpen', isOpen);
      },
      setIsDuplicateDialogOpen(isOpen: boolean) {
        setState('isDuplicateDialogOpen', isOpen);
      },
      setIsIssueDialogOpen(isOpen: boolean) {
        setState('isIssueDialogOpen', isOpen);
      }
    }
  ];

  async function fetchOrders() {
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

      setState('orders', recentOrders);
    }
  }

  createEffect(() => {
    if (props.patientId) {
      fetchOrders();
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
RecentOrders.CancelDialog = RecentOrdersCancelDialog;
RecentOrders.DuplicateDialog = RecentOrdersDuplicateDialog;
RecentOrders.IssueDialog = RecentOrdersIssueDialog;

export default RecentOrders;
