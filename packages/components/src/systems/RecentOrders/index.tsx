import {
  createContext,
  JSXElement,
  useContext,
  createEffect,
  createSignal,
  Accessor
} from 'solid-js';
import { gql } from '@apollo/client';
import RecentOrdersCard from './RecentOrdersCard';
import { usePhotonClient } from '../SDKProvider';
import { Order } from '@photonhealth/sdk/dist/types';

const RecentOrdersContext = createContext<{ orders: Accessor<Order[]> }>();

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
  const [orders, setOrders] = createSignal<Order[]>([]);

  async function fetchOrders() {
    const { data } = await client!.apollo.query({
      query: GetPatientOrdersQuery,
      variables: {
        patientId: props.patientId
      }
    });

    if (data?.patient?.orders?.length > 0) {
      setOrders(data.patient.orders);
    }
  }

  createEffect(() => {
    if (props.patientId) {
      fetchOrders();
    }
  });

  return (
    <RecentOrdersContext.Provider value={{ orders }}>{props.children}</RecentOrdersContext.Provider>
  );
}

export function useRecentOrders() {
  return useContext(RecentOrdersContext);
}

RecentOrders.Card = RecentOrdersCard;

export default RecentOrders;
