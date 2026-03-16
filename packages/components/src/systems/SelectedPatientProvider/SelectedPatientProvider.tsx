import { Accessor, createContext, createMemo, JSXElement, useContext } from 'solid-js';
import { Address as SdkAddress } from '@photonhealth/sdk/dist/types';
import { usePhotonClient } from '../SDKProvider';
import { GetPatientPreferredPharmaciesAndAddress } from '../../fetch';
import { createQuery } from '../../utils/createQuery';
import {
  GetLastOrderQuery,
  GetLastOrderResponse,
  GetPreferredPharmaciesResponse,
  PreferredPharmacy
} from './queries';

export interface SelectedPatientContextType {
  preferredPharmacies: Accessor<PreferredPharmacy[]>;
  preferredPharmacyId: Accessor<string | undefined>;
  recentOrder: Accessor<
    { createdAt: string; pharmacy: { id: string; name: string; address: SdkAddress } } | undefined
  >;
  patientPharmacyDataLoading: Accessor<boolean>;
}

const SelectedPatientContext = createContext<SelectedPatientContextType>();

interface SelectedPatientProviderProps {
  children: JSXElement;
  patientId?: string;
}

export const SelectedPatientProvider = (props: SelectedPatientProviderProps) => {
  const client = usePhotonClient();

  const queryOptions = createMemo(() => ({
    variables: { id: props.patientId! },
    client: client!.apollo,
    skip: !props.patientId
  }));

  const preferredPharmaciesData = createQuery<GetPreferredPharmaciesResponse, { id: string }>(
    GetPatientPreferredPharmaciesAndAddress,
    queryOptions
  );

  const lastOrderData = createQuery<GetLastOrderResponse, { id: string }>(
    GetLastOrderQuery,
    queryOptions
  );

  const patientPharmacyDataLoading = createMemo(
    () => preferredPharmaciesData.loading || lastOrderData.loading
  );

  const preferredPharmacies = createMemo(() => {
    return preferredPharmaciesData()?.patient?.preferredPharmacies ?? [];
  });

  const preferredPharmacyId = createMemo(() => {
    const pharmacies = preferredPharmacies();
    return pharmacies.length > 0 ? pharmacies[0].id : undefined;
  });

  const recentOrder = createMemo(() => {
    const lastOrder = lastOrderData()?.orders?.[0];
    if (lastOrder) {
      const now = new Date();
      const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
      if (new Date(lastOrder.createdAt) > eightHoursAgo) {
        return lastOrder;
      }
    }
  });

  const value: SelectedPatientContextType = {
    preferredPharmacies,
    preferredPharmacyId,
    recentOrder,
    patientPharmacyDataLoading
  };

  return (
    <SelectedPatientContext.Provider value={value}>
      {props.children}
    </SelectedPatientContext.Provider>
  );
};

export const useSelectedPatientContext = () => {
  const context = useContext(SelectedPatientContext);
  if (!context) {
    throw new Error('useSelectedPatientContext must be used within SelectedPatientProvider');
  }
  return context;
};
