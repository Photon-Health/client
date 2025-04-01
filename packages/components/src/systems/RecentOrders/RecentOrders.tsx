import {
  createContext,
  JSXElement,
  useContext,
  createEffect,
  createMemo,
  createSignal
} from 'solid-js';
import { gql } from '@apollo/client';
import RecentOrdersCard from './RecentOrdersCard';
import { usePhotonClient } from '../SDKProvider';
import { createStore } from 'solid-js/store';
import RecentOrdersDuplicateDialog from './RecentOrdersDuplicateDialog';
import RecentOrdersIssueDialog from './RecentOrdersIssueDialog';
import RecentOrdersCombineDialog from './RecentOrdersCombineDialog';
import { Address } from '../PatientInfo';
import { BaseOptions, createQuery } from '../../utils/createQuery';
import {
  Order as FullOrder,
  Fill as FullFill,
  Prescription as FullPrescription,
  OrderState
} from '@photonhealth/sdk/dist/types';
import { usePrescribe } from '../PrescribeProvider';
import { GetPrescription } from '../../fetch/queries';

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
            writtenAt
            prescriber {
              name {
                full
              }
            }
          }
        }
      }
    }
  }
`;

type GetPatientOrdersVars = {
  patientId: string;
};

// we will generate these soon...
type Treatment = Pick<FullFill['treatment'], 'name'>;
type Prescription = Pick<
  FullPrescription,
  | 'dispenseQuantity'
  | 'dispenseUnit'
  | 'fillsAllowed'
  | 'instructions'
  | 'writtenAt'
  | 'prescriber'
  | 'id'
>;
type Fill = {
  treatment: Treatment;
  prescription: Prescription;
};
type Order = Pick<FullOrder, 'id' | 'createdAt' | 'state'> & { fills: Fill[] };

interface GetPatientOrdersResponse {
  patient: {
    id: string;
    name: {
      full: string;
    };
    orders: Order[];
  };
}

type RecentOrdersState = {
  orders: Order[];
  isCombineDialogOpen: boolean;
  isDuplicateDialogOpen: boolean;
  isIssueDialogOpen: boolean;
  isLoading: boolean;
  patientId?: string;
  patientName?: string;
  // in case the combine order fails, we need address to make a new order
  address?: Address;
  // if provider chooses not to combine the order, call this to create a new order
  createOrder?: () => void;
  // if the user clicks "continue" on the duplicate dialog, we need to call the callback to add to draft prescriptions
  duplicateDialogContinueCb?: () => void;
  // reference for the order that the user clicked
  orderWithIssue?: Order;
  // reference for the fill with a duplicate treatment name
  duplicateFill?: Fill;
};

type RecentOrdersActions = {
  setIsCombineDialogOpen: (
    isOpen: boolean,
    createOrder?: () => void,
    draftPrescriptions?: Prescription[],
    address?: Address
  ) => void;
  setIsDuplicateDialogOpen: (
    isOpen: boolean,
    duplicate?: { order: Order; fill: Fill },
    continueCb?: () => void
  ) => void;
  setIsIssueDialogOpen: (isOpen: boolean, orderWithIssue?: Order) => void;
  checkDuplicateFill: (treatmentName: string) => { order: Order; fill: Fill } | undefined;
  hasRoutingOrder: () => boolean;
};

type RecentOrdersContextValue = [RecentOrdersState, RecentOrdersActions];

const RecentOrdersContext = createContext<RecentOrdersContextValue>([
  {
    orders: [],
    isLoading: false,
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
  const prescribeContext = usePrescribe();
  if (!prescribeContext) {
    throw new Error('PrescribeWorkflow must be wrapped with PrescribeProvider');
  }
  const { prescriptionIds } = prescribeContext;

  const [draftPrescriptions, setDraftPrescriptions] = createSignal<Prescription[]>([]);
  const [state, setState] = createStore<RecentOrdersState>({
    orders: [],
    isLoading: true,
    isCombineDialogOpen: false,
    isDuplicateDialogOpen: false,
    isIssueDialogOpen: false,
    duplicateDialogContinueCb: () => undefined
  });

  // we need to make this reactive because we need to re-query when the patientId changes
  const options = createMemo<BaseOptions<GetPatientOrdersResponse, GetPatientOrdersVars>>(() => ({
    variables: {
      patientId: props.patientId
    },
    skip: !props.patientId,
    client: client!.apollo,
    fetchPolicy: 'network-only'
  }));
  const data = createQuery<GetPatientOrdersResponse, GetPatientOrdersVars>(
    GetPatientOrdersQuery,
    options
  );

  const value: RecentOrdersContextValue = [
    state,
    {
      setIsCombineDialogOpen(isOpen, createOrder, draftPrescriptions, address) {
        setState({
          isCombineDialogOpen: isOpen,
          ...(createOrder ? { createOrder } : { createOrderCb: undefined }),
          ...(draftPrescriptions ? { draftPrescriptions } : { draftPrescriptions: [] }),
          ...(address ? { address } : { address: undefined })
        });
      },
      setIsDuplicateDialogOpen(isOpen, duplicate, continueCb) {
        setState({
          isDuplicateDialogOpen: isOpen,
          ...(continueCb
            ? { duplicateDialogContinueCb: continueCb }
            : { duplicateDialogContinueCb: undefined }),
          ...(duplicate ? { duplicateFill: duplicate.fill } : {}),
          ...(duplicate ? { orderWithIssue: duplicate.order } : {})
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
        const nonCanceledOrders = state.orders.filter(
          (order) => order.state !== OrderState.Canceled
        );
        for (const order of nonCanceledOrders) {
          const fill = order.fills.find((fill) => fill.treatment.name === treatmentName);
          if (fill !== undefined) {
            return { order, fill };
          }
        }
        return undefined;
      },
      hasRoutingOrder() {
        return state.orders.some((order) => order.state === 'ROUTING');
      }
    }
  ];

  // // fetch new prescriptions when the prescriptionIds change
  // // set them as draft prescriptions to match against recent orders
  // createEffect(() => {
  //   if (prescriptionIds().length > 0) {
  //     // make sure prescriptionIds don't exist in draftPrescriptions
  //     const existingPrescriptionIds = draftPrescriptions().map(
  //       (prescription: Prescription) => prescription.id
  //     );
  //     const newPrescriptionIds = prescriptionIds().filter(
  //       (id) => !existingPrescriptionIds.includes(id)
  //     );

  //     // Create an async function to handle the prescription fetching
  //     const fetchNewPrescriptions = async () => {
  //       // fetch the new prescriptions
  //       const newPrescriptions = await Promise.all(
  //         newPrescriptionIds.map((id) =>
  //           client!.apollo.query({
  //             query: GetPrescription,
  //             variables: { id }
  //           })
  //         )
  //       );

  //       //set the new prescriptions
  //       setDraftPrescriptions(
  //         newPrescriptions.map((prescription) => prescription.data.prescription)
  //       );
  //     };

  //     if (newPrescriptionIds.length > 0) {
  //       // Call the async function
  //       fetchNewPrescriptions();
  //     }
  //   }
  // });

  createEffect(() => {
    setState({ isLoading: data.loading });
    const patient = data()?.patient;
    if (!data.loading && patient) {
      const orders = patient?.orders;

      if (orders?.length > 0) {
        const now = new Date();
        const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

        const recentOrders = orders.filter((order: Order) => {
          const createdAt = new Date(order.createdAt);
          return createdAt > eightHoursAgo;
        });

        setState({
          orders: recentOrders,
          patientName: patient?.name?.full,
          patientId: patient?.id
        });
      }
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
