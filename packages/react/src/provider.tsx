/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApolloClient,
  ApolloError,
  ApolloProvider,
  DocumentNode,
  NormalizedCacheObject
} from '@apollo/client';
import { useStore } from '@nanostores/react';
import { GraphQLFormattedError } from 'graphql';
import { action, map } from 'nanostores';
import { Env, PhotonClient } from '@photonhealth/sdk';
import {
  Allergen,
  AllergenFilter,
  Catalog,
  Client,
  DispenseUnit,
  FulfillmentType,
  LatLongSearch,
  Maybe,
  MedicalEquipment,
  Medication,
  MedicationFilter,
  Order,
  Organization,
  Patient,
  Pharmacy,
  Prescription,
  PrescriptionState,
  PrescriptionTemplate,
  SearchMedication,
  Treatment,
  WebhookConfig
} from '@photonhealth/sdk/dist/types';
import { useEffect, createContext, useContext, useReducer, useCallback } from 'react';
import { GetAllergensOptions } from '@photonhealth/sdk/dist/clinical/allergen';

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'INITIALISED':
      return {
        ...state,
        isAuthenticated: !!action.user,
        user: action.user,
        isLoading: false,
        error: undefined
      };
    case 'HANDLE_REDIRECT_COMPLETE':
      if (state.user?.updated_at === action.user?.updated_at) {
        return state;
      }
      return {
        ...state,
        isAuthenticated: !!action.user,
        user: action.user
      };
    case 'GET_ACCESS_TOKEN_COMPLETE':
      if (state.user?.updated_at === action.user?.updated_at) {
        return state;
      }
      return {
        ...state,
        isAuthenticated: !!action.user,
        user: action.user
      };
    case 'ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined
      };
  }
};

const defaultOnRedirectCallback = (appState?: any): void => {
  window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname);
};

export type GetCatalogReturn = {
  catalog: Catalog;
  loading: boolean;
  error?: ApolloError;
  refetch: PhotonClient['clinical']['catalog']['getCatalog'];
  query?: ({ id, fragment }: { id: string; fragment?: Record<string, DocumentNode> }) => Promise<{
    catalog?: Catalog;
    loading: boolean;
    error?: ApolloError;
  }>;
};

export type GetMedicationReturn = {
  medications: Medication[];
  loading: boolean;
  error?: ApolloError;
  refetch: PhotonClient['clinical']['medication']['getMedications'];
};

export type GetMedicalEquipmentReturn = {
  medicalEquipment: MedicalEquipment[];
  loading: boolean;
  error?: ApolloError;
  refetch: PhotonClient['clinical']['medicalEquipment']['getMedicalEquipment'];
};

export type GetAllergensReturn = {
  allergens: Allergen[];
  loading: boolean;
  error?: ApolloError;
  refetch: PhotonClient['clinical']['allergens']['getAllergens'];
};

export interface PhotonClientContextInterface {
  env: Env;
  clinicalClient: ApolloClient<NormalizedCacheObject> | undefined;
  getPatient: ({ id, fragment }: { id: string; fragment?: Record<string, DocumentNode> }) => {
    patient: Patient;
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['patient']['getPatient'];
  };
  getDispenseUnits: () => {
    dispenseUnits: DispenseUnit[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['prescription']['getDispenseUnits'];
  };
  getPatients: ({
    after,
    first,
    name
  }: {
    after?: Maybe<string>;
    first?: Maybe<number>;
    name?: Maybe<string>;
  }) => {
    patients: Patient[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['patient']['getPatients'];
  };
  createPatient: ({
    refetchQueries,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { createPatient: Patient } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  updatePatient: ({
    refetchQueries,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { updatePatient: Patient } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  removePatientAllergy: ({
    refetchQueries,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { removePatientAllergy: Patient } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  removePatientPreferredPharmacy: ({
    refetchQueries,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { removePatientPreferredPharmacy: Patient } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  getOrder: ({ id }: { id: string }) => {
    order: Order;
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['order']['getOrder'];
  };
  getOrders: ({
    after,
    first,
    patientId,
    patientName
  }: {
    after?: Maybe<string>;
    first?: Maybe<number>;
    patientId?: Maybe<string>;
    patientName?: Maybe<string>;
  }) => {
    orders: Order[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['order']['getOrders'];
  };
  createOrder: ({
    refetchQueries,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { createOrder: Order } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  addToCatalog: ({
    refetchQueries,
    refetchArgs,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    refetchArgs?: Record<string, any>;
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { addToCatalog: Treatment } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  removeFromCatalog: ({
    refetchQueries,
    refetchArgs,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    refetchArgs?: Record<string, any>;
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { removeFromCatalog: Treatment } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  createPrescriptionTemplate: ({
    refetchQueries,
    awaitRefetchQueries,
    refetchArgs
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
    refetchArgs?: Record<string, any>;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { createPrescriptionTemplate: PrescriptionTemplate } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  updatePrescriptionTemplate: ({
    refetchQueries,
    awaitRefetchQueries,
    refetchArgs
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
    refetchArgs?: Record<string, any>;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { updatePrescriptionTemplate: PrescriptionTemplate } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  deletePrescriptionTemplate: ({
    refetchQueries,
    awaitRefetchQueries,
    refetchArgs
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
    refetchArgs?: Record<string, any>;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { deletePrescriptionTemplate: PrescriptionTemplate } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  getPrescription: ({ id }: { id: string }) => {
    prescription: Prescription;
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['prescription']['getPrescription'];
  };
  getMedicationConcepts: ({ name, defer }: { name: string; defer?: boolean }) => {
    medicationConcepts: SearchMedication[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['searchMedication']['getConcepts'];
    query?: ({ name }: { name: string }) => Promise<{
      medicationConcepts: SearchMedication[];
      loading: boolean;
      error?: ApolloError;
    }>;
  };
  getMedicationStrengths: ({ id, defer }: { id: string; defer?: boolean }) => {
    medicationStrengths: SearchMedication[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['searchMedication']['getStrengths'];
    query?: ({ id }: { id: string }) => Promise<{
      medicationStrengths: SearchMedication[];
      loading: boolean;
      error?: ApolloError;
    }>;
  };
  getMedicationRoutes: ({ id, defer }: { id: string; defer?: boolean }) => {
    medicationRoutes: SearchMedication[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['searchMedication']['getRoutes'];
    query?: ({ id }: { id: string }) => Promise<{
      medicationRoutes: SearchMedication[];
      loading: boolean;
      error?: ApolloError;
    }>;
  };
  getMedicationForms: ({ id, defer }: { id: string; defer?: boolean }) => {
    medicationForms: Medication[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['searchMedication']['getForms'];
    query?: ({ id }: { id: string }) => Promise<{
      medicationForms: Medication[];
      loading: boolean;
      error?: ApolloError;
    }>;
  };
  getMedicationProducts: ({ id, defer }: { id: string; defer?: boolean }) => {
    medicationProducts: Medication[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['searchMedication']['getProducts'];
    query?: ({ id }: { id: string }) => Promise<{
      medicationProducts: Medication[];
      loading: boolean;
      error?: ApolloError;
    }>;
  };
  getMedicationPackages: ({ id, defer }: { id: string; defer?: boolean }) => {
    medicationPackages: Medication[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['searchMedication']['getPackages'];
    query?: ({ id }: { id: string }) => Promise<{
      medicationPackages: Medication[];
      loading: boolean;
      error?: ApolloError;
    }>;
  };
  getPrescriptions: ({
    patientId,
    patientName,
    prescriberId,
    state,
    after,
    first
  }: {
    patientId?: Maybe<string>;
    patientName?: Maybe<string>;
    prescriberId?: Maybe<string>;
    state?: Maybe<PrescriptionState>;
    after?: Maybe<string>;
    first?: Maybe<number>;
  }) => {
    prescriptions: Prescription[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['prescription']['getPrescriptions'];
  };
  createPrescription: ({
    refetchQueries,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { createPrescription: Prescription } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  getCatalog: ({
    id,
    fragment,
    defer
  }: {
    id: string;
    fragment?: Record<string, DocumentNode>;
    defer?: boolean;
  }) => GetCatalogReturn;
  getCatalogs: () => {
    catalogs: Catalog[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['catalog']['getCatalogs'];
  };
  getMedications: ({
    filter,
    first,
    after
  }: {
    filter?: MedicationFilter;
    first?: number;
    after?: string;
  }) => GetMedicationReturn;
  getMedicalEquipment: ({
    name,
    first,
    after
  }: {
    name?: string;
    first?: number;
    after?: string;
  }) => GetMedicalEquipmentReturn;
  getAllergens: ({ filter }: { filter?: AllergenFilter }) => GetAllergensReturn;
  getPharmacy: ({ id }: { id: string }) => {
    pharmacy: Pharmacy;
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['pharmacy']['getPharmacy'];
  };
  getPharmacies: ({
    name,
    type,
    location
  }: {
    name?: Maybe<string>;
    type?: Maybe<FulfillmentType>;
    location?: Maybe<LatLongSearch>;
  }) => {
    pharmacies: Pharmacy[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['clinical']['pharmacy']['getPharmacies'];
  };
  getOrganization: () => {
    organization: Organization;
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['management']['organization']['getOrganization'];
  };
  getOrganizations: () => {
    organizations: Organization[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['management']['organization']['getOrganizations'];
  };
  getWebhooks: () => {
    webhooks: WebhookConfig[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['management']['webhook']['getWebhooks'];
  };
  createWebhook: ({
    refetchQueries,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { createWebhook: WebhookConfig } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  deleteWebhook: ({
    refetchQueries,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { deleteWebhook: boolean } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  getClients: () => {
    clients: Client[];
    loading: boolean;
    error?: ApolloError;
    refetch: PhotonClient['management']['client']['getClients'];
  };
  rotateSecret: ({
    refetchQueries,
    awaitRefetchQueries
  }: {
    refetchQueries: string[];
    awaitRefetchQueries?: boolean;
  }) => [
    ({
      variables,
      onCompleted
    }: {
      variables: object;
      onCompleted?: (data: any) => void | undefined;
    }) => Promise<void>,
    {
      data: { rotateSecret: Client } | undefined | null;
      error: GraphQLFormattedError;
      loading: boolean;
    }
  ];
  clearError: () => void;
  login: PhotonClient['authentication']['login'];
  getToken: PhotonClient['authentication']['getAccessToken'];
  handleRedirect: PhotonClient['authentication']['handleRedirect'];
  logout: PhotonClient['authentication']['logout'];
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
  error: any;
  setOrganization: (organizationId: string) => void;
  clearOrganization: () => void;
}

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <PhotonProvider>.');
};

const PhotonClientContext = createContext<PhotonClientContextInterface>({
  env: process.env.REACT_APP_ENV_NAME as Env,
  clinicalClient: undefined,
  getAllergens: stub,
  getPatients: stub,
  getDispenseUnits: stub,
  getPatient: stub,
  createPatient: stub,
  updatePatient: stub,
  removePatientAllergy: stub,
  removePatientPreferredPharmacy: stub,
  createOrder: stub,
  createPrescriptionTemplate: stub,
  updatePrescriptionTemplate: stub,
  deletePrescriptionTemplate: stub,
  getClients: stub,
  getPharmacy: stub,
  getPharmacies: stub,
  getMedications: stub,
  getMedicalEquipment: stub,
  getCatalog: stub,
  getCatalogs: stub,
  getWebhooks: stub,
  getOrganizations: stub,
  getPrescriptions: stub,
  getOrganization: stub,
  getOrder: stub,
  getOrders: stub,
  getPrescription: stub,
  createPrescription: stub,
  createWebhook: stub,
  deleteWebhook: stub,
  login: stub,
  rotateSecret: stub,
  handleRedirect: stub,
  logout: stub,
  clearError: stub,
  getToken: stub,
  isLoading: true,
  isAuthenticated: false,
  user: undefined,
  error: undefined,
  setOrganization: stub,
  clearOrganization: stub,
  addToCatalog: stub,
  removeFromCatalog: stub,
  getMedicationConcepts: stub,
  getMedicationStrengths: stub,
  getMedicationRoutes: stub,
  getMedicationForms: stub,
  getMedicationProducts: stub,
  getMedicationPackages: stub
});

export const PhotonProvider = (opts: {
  env: Env;
  children: any;
  client: PhotonClient;
  searchParams?: string;
  onRedirectCallback?: any;
}) => {
  const { children, client, onRedirectCallback = defaultOnRedirectCallback, searchParams } = opts;
  const [state, dispatch] = useReducer(reducer, {
    isAuthenticated: false,
    isLoading: true
  });

  const functionLookup: Record<string, (...args: any) => any> = {};

  useEffect(() => {
    const initialize = async () => {
      if (client.authentication.hasAuthParams()) {
        try {
          // @ts-ignore
          const { appState } = await client.authentication.handleRedirect(state?.returnTo);
          onRedirectCallback(appState);
        } catch (e) {
          const message = (e as Error).message;
          dispatch({ type: 'ERROR', error: message });
        }
      }
      const user = await client.authentication.getUser();
      if (user) {
        client.setOrganization(user.org_id);
      }
      await client.authentication.checkSession();
      dispatch({ type: 'INITIALISED', user });
    };
    initialize();
  }, [client, onRedirectCallback]);

  /// Auth0

  const handleRedirect = useCallback(
    async (url?: string) => {
      try {
        await client.authentication.handleRedirect(url);
      } catch (e) {
        const message = (e as Error).message;
        dispatch({ type: 'ERROR', error: message });
      }
      dispatch({
        type: 'HANDLE_REDIRECT_COMPLETE',
        user: await client.authentication.getUser()
      });
    },
    [client.authentication]
  );

  useEffect(() => {
    if (client.authentication.hasAuthParams(searchParams)) {
      handleRedirect();
    }
  }, [client.authentication, handleRedirect, searchParams]);

  const login = ({
    organizationId,
    invitation,
    appState
  }: {
    organizationId?: string;
    invitation?: string;
    appState?: object;
  } = {}) => {
    return client.authentication.login({
      organizationId,
      invitation,
      appState
    });
  };

  const clearError = () => {
    dispatch({
      type: 'CLEAR_ERROR'
    });
  };

  const logout = ({ returnTo, federated }: { returnTo?: string; federated?: boolean }) =>
    client.authentication.logout({ returnTo, federated });

  const getToken = async ({ audience }: { audience?: string } = {}) => {
    try {
      const token = await client.authentication.getAccessToken({ audience });
      dispatch({
        type: 'GET_ACCESS_TOKEN_COMPLETE',
        user: await client.authentication.getUser()
      });
      return token;
    } catch (e) {
      console.error(e);
    }
  };
  /// Utilities

  const runRefetch = async (refetchQueries: string[], args?: Record<string, any>) => {
    if (refetchQueries) {
      const promises = refetchQueries
        .filter((x) => {
          if (!Object.keys(functionLookup).includes(x)) {
            console.warn(`${x} is not a defined query in the React SDK`);
            return false;
          }
          return true;
        })
        .map((x) => {
          const fn = functionLookup[x];
          if (args) {
            return fn(args);
          } else {
            return fn();
          }
        });
      await Promise.all(promises);
    }
  };

  /// Patient

  const getPatientStore = map<{
    patient?: Patient;
    loading: boolean;
    error?: ApolloError;
  }>({
    patient: undefined,
    loading: true,
    error: undefined
  });

  const fetchPatient = action(getPatientStore, 'fetchPatient', async (store, { id, fragment }) => {
    store.setKey('loading', true);
    const { data, error } = await client.clinical.patient.getPatient({
      id,
      fragment
    });
    store.setKey('patient', data?.patient || undefined);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetPatient = ({
    id,
    fragment
  }: {
    id: string;
    fragment?: Record<string, DocumentNode>;
  }) => {
    const { patient, loading, error } = useStore(getPatientStore);

    useEffect(() => {
      fetchPatient({ id, fragment });
    }, [fragment, id]);

    return {
      patient,
      loading,
      error,
      refetch: ({ id }: { id: string }) => client.clinical.patient.getPatient({ id, fragment })
    };
  };

  const getPatientsStore = map<{
    patients: Patient[];
    loading: boolean;
    error?: ApolloError;
  }>({
    patients: [],
    loading: true,
    error: undefined
  });

  const fetchPatients = action(getPatientsStore, 'fetchPatients', async (store, args?: any) => {
    store.setKey('loading', true);
    const { data, error } = await client.clinical.patient.getPatients({
      after: args?.after,
      first: args?.first || 25,
      name: args?.name
    });
    store.setKey('patients', data?.patients || []);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetPatients = (
    {
      after,
      first,
      name
    }: {
      after?: string;
      first?: number;
      name?: string;
    } = { first: 25 }
  ) => {
    const { patients, loading, error } = useStore(getPatientsStore);

    useEffect(() => {
      fetchPatients({ after, first, name });
    }, [after, first, name]);

    return {
      patients,
      loading,
      error,
      refetch: (
        {
          after,
          first,
          name
        }: {
          after?: string;
          first?: number;
          name?: string;
        } = { first: 25 }
      ) => client.clinical.patient.getPatients({ after, first, name })
    };
  };

  const createPatientStore = map<{
    createPatient?: Patient;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    createPatient: undefined,
    loading: false,
    error: undefined
  });

  const createPatientMutation = client.clinical.patient.createPatient({});

  const constructFetchCreatePatient = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) =>
    action(
      createPatientStore,
      'createPatientMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await createPatientMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('createPatient', data?.createPatient);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            await runRefetch(refetchQueries);
          }
        } catch (err) {
          store.setKey('createPatient', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useCreatePatient = ({
    refetchQueries = undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    awaitRefetchQueries = false
  }: {
    refetchQueries?: string[];
    awaitRefetchQueries?: boolean;
  }) => {
    const { createPatient, loading, error } = useStore(createPatientStore);

    return [
      constructFetchCreatePatient({ refetchQueries }),
      {
        createPatient,
        loading,
        error
      }
    ];
  };

  const updatePatientStore = map<{
    updatePatient?: Patient;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    updatePatient: undefined,
    loading: false,
    error: undefined
  });

  const updatePatientMutation = client.clinical.patient.updatePatient({});

  const constructFetchUpdatePatient = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) =>
    action(
      updatePatientStore,
      'updatePatientMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await updatePatientMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('updatePatient', data?.updatePatient);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            await runRefetch(refetchQueries);
          }
        } catch (err) {
          store.setKey('updatePatient', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useUpdatePatient = ({ refetchQueries = undefined }: { refetchQueries?: string[] }) => {
    const { updatePatient, loading, error } = useStore(updatePatientStore);

    return [
      constructFetchUpdatePatient({ refetchQueries }),
      {
        updatePatient,
        loading,
        error
      }
    ];
  };

  const removePatientAllergyStore = map<{
    removePatientAllergy?: Patient;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    removePatientAllergy: undefined,
    loading: false,
    error: undefined
  });

  const removePatientAllergyMutation = client.clinical.patient.removePatientAllergy({});

  const constructFetchRemovePatientAllergy = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) =>
    action(
      removePatientAllergyStore,
      'removePatientAllergyMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await removePatientAllergyMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('removePatientAllergy', data?.removePatientAllergy);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            runRefetch(refetchQueries);
          }
        } catch (err) {
          store.setKey('removePatientAllergy', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useRemovePatientAllergy = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) => {
    const { removePatientAllergy, loading, error } = useStore(removePatientAllergyStore);

    return [
      constructFetchRemovePatientAllergy({ refetchQueries }),
      {
        removePatientAllergy,
        loading,
        error
      }
    ];
  };

  const removePatientPreferredPharmacyStore = map<{
    removePatientPreferredPharmacy?: Patient;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    removePatientPreferredPharmacy: undefined,
    loading: false,
    error: undefined
  });

  const removePatientPreferredPharmacyMutation =
    client.clinical.patient.removePatientPreferredPharmacy({});

  const constructFetchRemovePatientPreferredPharmacy = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) =>
    action(
      removePatientPreferredPharmacyStore,
      'removePatientPreferredPharmacyMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await removePatientPreferredPharmacyMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('removePatientPreferredPharmacy', data?.removePatientPreferredPharmacy);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            runRefetch(refetchQueries);
          }
        } catch (err) {
          store.setKey('removePatientPreferredPharmacy', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useRemovePatientPreferredPharmacy = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) => {
    const { removePatientPreferredPharmacy, loading, error } = useStore(
      removePatientPreferredPharmacyStore
    );

    return [
      constructFetchRemovePatientPreferredPharmacy({ refetchQueries }),
      {
        removePatientPreferredPharmacy,
        loading,
        error
      }
    ];
  };

  /// Order

  const getOrderStore = map<{
    order?: Order;
    loading: boolean;
    error?: ApolloError;
  }>({
    order: undefined,
    loading: true,
    error: undefined
  });

  const fetchOrder = action(getOrderStore, 'fetchOrder', async (store, { id }) => {
    store.setKey('loading', true);
    const { data, error } = await client.clinical.order.getOrder({
      id
    });
    store.setKey('order', data?.order || undefined);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetOrder = ({ id }: { id: string }) => {
    const { order, loading, error } = useStore(getOrderStore);

    useEffect(() => {
      fetchOrder({ id });
    }, [id]);

    return {
      order,
      loading,
      error,
      refetch: ({ id }: { id: string }) => client.clinical.order.getOrder({ id })
    };
  };

  const getOrdersStore = map<{
    orders: Order[];
    loading: boolean;
    error?: ApolloError;
  }>({
    orders: [],
    loading: true,
    error: undefined
  });

  const fetchOrders = action(getOrdersStore, 'fetchOrders', async (store, args?: any) => {
    store.setKey('loading', true);
    const { data, error } = await client.clinical.order.getOrders({
      after: args?.after,
      first: args?.first || 25,
      patientName: args?.patientName,
      patientId: args?.patientId
    });
    store.setKey('orders', data?.orders || []);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetOrders = (
    {
      after,
      first,
      patientId,
      patientName
    }: {
      after?: string;
      first?: number;
      patientId?: string;
      patientName?: string;
    } = { first: 25 }
  ) => {
    const { orders, loading, error } = useStore(getOrdersStore);

    useEffect(() => {
      fetchOrders({ after, first, patientId, patientName });
    }, [after, first, patientId, patientName]);

    return {
      orders,
      loading,
      error,
      refetch: (
        {
          after,
          first,
          patientId,
          patientName
        }: {
          after?: string;
          first?: number;
          patientId?: string;
          patientName?: string;
        } = { first: 25 }
      ) =>
        client.clinical.order.getOrders({
          after,
          first,
          patientId,
          patientName
        })
    };
  };

  const createOrderStore = map<{
    createOrder?: Order;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    createOrder: undefined,
    loading: false,
    error: undefined
  });

  const createOrderMutation = client.clinical.order.createOrder({});

  const constructFetchCreateOrder = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) =>
    action(createOrderStore, 'createOrderMutation', async (store, { variables, onCompleted }) => {
      store.setKey('loading', true);

      try {
        const { data, errors } = await createOrderMutation({
          variables,
          refetchQueries: [],
          awaitRefetchQueries: false
        });
        store.setKey('createOrder', data?.createOrder);
        store.setKey('error', errors?.[0]);
        if (onCompleted) {
          onCompleted(data);
        }
        if (refetchQueries && refetchQueries.length > 0) {
          runRefetch(refetchQueries);
        }
      } catch (err) {
        store.setKey('createOrder', undefined);
        store.setKey('error', err as GraphQLFormattedError);
      }

      store.setKey('loading', false);
    });

  const useCreateOrder = ({ refetchQueries = undefined }: { refetchQueries?: string[] }) => {
    const { createOrder, loading, error } = useStore(createOrderStore);

    return [
      constructFetchCreateOrder({ refetchQueries }),
      {
        createOrder,
        loading,
        error
      }
    ];
  };

  /// DispenseUnits

  const getDispenseUnitsStore = map<{
    dispenseUnits?: DispenseUnit[];
    loading: boolean;
    error?: ApolloError;
  }>({
    dispenseUnits: undefined,
    loading: true,
    error: undefined
  });

  const fetchDispenseUnits = action(getDispenseUnitsStore, 'fetchDispenseUnits', async (store) => {
    store.setKey('loading', true);
    const { data, error } = await client.clinical.prescription.getDispenseUnits({});
    store.setKey('dispenseUnits', data?.dispenseUnits || undefined);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetDispenseUnits = () => {
    const { dispenseUnits, loading, error } = useStore(getDispenseUnitsStore);

    useEffect(() => {
      fetchDispenseUnits();
    }, []);

    return {
      dispenseUnits,
      loading,
      error,
      refetch: () => client.clinical.prescription.getDispenseUnits()
    };
  };

  /// Prescription

  const getPrescriptionStore = map<{
    prescription?: Prescription;
    loading: boolean;
    error?: ApolloError;
  }>({
    prescription: undefined,
    loading: true,
    error: undefined
  });

  const fetchPrescription = action(
    getPrescriptionStore,
    'fetchPrescription',
    async (store, { id }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.prescription.getPrescription({
        id
      });
      store.setKey('prescription', data?.prescription || undefined);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetPrescription = ({ id }: { id: string }) => {
    const { prescription, loading, error } = useStore(getPrescriptionStore);

    useEffect(() => {
      fetchPrescription({ id });
    }, [id]);

    return {
      prescription,
      loading,
      error,
      refetch: ({ id }: { id: string }) => client.clinical.prescription.getPrescription({ id })
    };
  };

  const getPrescriptionsStore = map<{
    prescriptions: Prescription[];
    loading: boolean;
    error?: ApolloError;
  }>({
    prescriptions: [],
    loading: true,
    error: undefined
  });

  const fetchPrescriptions = action(
    getPrescriptionsStore,
    'fetchPrescriptions',
    async (store, args?: any) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.prescription.getPrescriptions({
        after: args?.after,
        first: args?.first || 25,
        patientName: args?.patientName,
        patientId: args?.patientId,
        prescriberId: args?.prescriberId,
        state: args?.state
      });
      store.setKey('prescriptions', data?.prescriptions || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetPrescriptions = (
    {
      after,
      first,
      patientId,
      patientName,
      prescriberId,
      state
    }: {
      after?: string;
      first?: number;
      patientId?: string;
      patientName?: string;
      prescriberId?: string;
      state?: PrescriptionState;
    } = { first: 25 }
  ) => {
    const { prescriptions, loading, error } = useStore(getPrescriptionsStore);

    useEffect(() => {
      fetchPrescriptions({
        after,
        first,
        patientId,
        patientName,
        prescriberId,
        state
      });
    }, [after, first, patientId, patientName, prescriberId, state]);

    return {
      prescriptions,
      loading,
      error,
      refetch: (
        {
          after,
          first,
          patientId,
          patientName,
          prescriberId,
          state
        }: {
          after?: string;
          first?: number;
          patientId?: string;
          patientName?: string;
          prescriberId?: string;
          state?: PrescriptionState;
        } = { first: 25 }
      ) =>
        client.clinical.prescription.getPrescriptions({
          after,
          first,
          patientId,
          patientName,
          prescriberId,
          state
        })
    };
  };

  const createPrescriptionStore = map<{
    createPrescription?: Prescription;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    createPrescription: undefined,
    loading: false,
    error: undefined
  });
  const createPrescriptionMutation = client.clinical.prescription.createPrescription({});

  const constructFetchCreatePrescription = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) =>
    action(
      createPrescriptionStore,
      'createPrescriptionMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await createPrescriptionMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('createPrescription', data?.createPrescription);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            runRefetch(refetchQueries);
          }
        } catch (err) {
          store.setKey('createPrescription', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useCreatePrescription = ({ refetchQueries = undefined }: { refetchQueries?: string[] }) => {
    const { createPrescription, loading, error } = useStore(createPrescriptionStore);

    return [
      constructFetchCreatePrescription({ refetchQueries }),
      {
        createPrescription,
        loading,
        error
      }
    ];
  };

  /// Catalog

  const getCatalogStore = map<{
    catalog?: Catalog;
    loading: boolean;
    error?: ApolloError;
  }>({
    catalog: undefined,
    loading: false,
    error: undefined
  });

  const fetchCatalog = action(getCatalogStore, 'fetchCatalog', async (store, { id, fragment }) => {
    store.setKey('loading', true);
    const { data, error } = await client.clinical.catalog.getCatalog({
      id,
      fragment
    });
    store.setKey('catalog', data?.catalog || undefined);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetCatalog = ({
    id,
    fragment,
    defer
  }: {
    id: string;
    fragment?: Record<string, DocumentNode>;
    defer?: boolean;
  }) => {
    const { catalog, loading, error } = useStore(getCatalogStore);

    useEffect(() => {
      if (!defer) {
        if (id) {
          fetchCatalog({ id, fragment });
        }
      }
    }, [defer, fragment, id]);

    return {
      catalog,
      loading,
      error,
      refetch: ({ id }: { id: string; fragment?: Record<string, DocumentNode> }) =>
        client.clinical.catalog.getCatalog({ id, fragment }),
      query: defer
        ? async ({ id, fragment }: { id: string; fragment?: Record<string, DocumentNode> }) => {
            await fetchCatalog({ id, fragment });
            return {
              catalog,
              loading,
              error
            };
          }
        : undefined
    };
  };

  const getCatalogsStore = map<{
    catalogs: Catalog[];
    loading: boolean;
    error?: ApolloError;
  }>({
    catalogs: [],
    loading: true,
    error: undefined
  });

  const fetchCatalogs = action(getCatalogsStore, 'fetchCatalogs', async (store) => {
    store.setKey('loading', true);
    const { data, error } = await client.clinical.catalog.getCatalogs();
    store.setKey('catalogs', data?.catalogs || []);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetCatalogs = () => {
    const { catalogs, loading, error } = useStore(getCatalogsStore);

    useEffect(() => {
      fetchCatalogs();
    }, []);

    return {
      catalogs,
      loading,
      error,
      refetch: () => client.clinical.catalog.getCatalogs()
    };
  };

  const addToCatalogStore = map<{
    addToCatalog?: Treatment;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    addToCatalog: undefined,
    loading: false,
    error: undefined
  });

  const addToCatalogMutation = client.clinical.catalog.addToCatalog({});

  const constructFetchAddToCatalog = ({
    refetchQueries = undefined,
    refetchArgs = undefined
  }: {
    refetchQueries?: string[];
    refetchArgs?: Record<string, any>;
  }) =>
    action(addToCatalogStore, 'addToCatalogMutation', async (store, { variables, onCompleted }) => {
      store.setKey('loading', true);

      try {
        const { data, errors } = await addToCatalogMutation({
          variables,
          refetchQueries: [],
          awaitRefetchQueries: false
        });
        store.setKey('addToCatalog', data?.addToCatalog);
        store.setKey('error', errors?.[0]);
        if (onCompleted) {
          onCompleted(data);
        }
        if (refetchQueries && refetchQueries.length > 0) {
          runRefetch(refetchQueries, refetchArgs);
        }
      } catch (err) {
        store.setKey('addToCatalog', undefined);
        store.setKey('error', err as GraphQLFormattedError);
      }

      store.setKey('loading', false);
    });

  const useAddToCatalog = ({
    refetchQueries = undefined,
    refetchArgs = undefined
  }: {
    refetchQueries?: string[];
    refetchArgs?: Record<string, any>;
  }) => {
    const { addToCatalog, loading, error } = useStore(addToCatalogStore);

    return [
      constructFetchAddToCatalog({ refetchQueries, refetchArgs }),
      {
        addToCatalog,
        loading,
        error
      }
    ];
  };

  const removeFromCatalogStore = map<{
    removeFromCatalog?: Treatment;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    removeFromCatalog: undefined,
    loading: false,
    error: undefined
  });

  const removeFromCatalogMutation = client.clinical.catalog.removeFromCatalog({});

  const constructFetchRemoveFromCatalog = ({
    refetchQueries = undefined,
    refetchArgs = undefined
  }: {
    refetchQueries?: string[];
    refetchArgs?: Record<string, any>;
  }) =>
    action(
      removeFromCatalogStore,
      'removeFromCatalogMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await removeFromCatalogMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('removeFromCatalog', data?.removeFromCatalog);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            await runRefetch(refetchQueries, refetchArgs);
          }
        } catch (err) {
          store.setKey('removeFromCatalog', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useRemoveFromCatalog = ({
    refetchQueries = undefined,
    refetchArgs = undefined
  }: {
    refetchQueries?: string[];
    refetchArgs?: Record<string, any>;
  }) => {
    const { removeFromCatalog, loading, error } = useStore(removeFromCatalogStore);

    return [
      constructFetchRemoveFromCatalog({ refetchQueries, refetchArgs }),
      {
        removeFromCatalog,
        loading,
        error
      }
    ];
  };

  /// Allergens

  const getAllergensStore = map<{
    allergens: Allergen[];
    loading: boolean;
    error?: ApolloError;
  }>({
    allergens: [],
    loading: true,
    error: undefined
  });

  const fetchAllergens = action(
    getAllergensStore,
    'fetchAllergens',
    async (store, { filter }: GetAllergensOptions) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.allergens.getAllergens({
        filter
      });
      store.setKey('allergens', data?.allergens || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetAllergens = ({ filter }: { filter?: AllergenFilter }) => {
    const { allergens, loading, error } = useStore(getAllergensStore);

    useEffect(() => {
      fetchAllergens({ filter });
    }, [filter, filter?.name]);

    return {
      allergens,
      loading,
      error,
      refetch: ({ filter }: { filter?: AllergenFilter }) =>
        client.clinical.allergens.getAllergens({ filter })
    };
  };

  /// Medication

  const getMedicationsStore = map<{
    medications: Medication[];
    loading: boolean;
    error?: ApolloError;
  }>({
    medications: [],
    loading: true,
    error: undefined
  });

  const fetchMedications = action(
    getMedicationsStore,
    'fetchMedications',
    async (store, { filter, first, after }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.medication.getMedications({
        filter,
        first,
        after
      });
      store.setKey('medications', data?.medications || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetMedications = ({
    filter,
    first,
    after
  }: {
    filter?: MedicationFilter;
    first?: number;
    after?: string;
  }) => {
    const { medications, loading, error } = useStore(getMedicationsStore);

    useEffect(() => {
      fetchMedications({ filter, first, after });
    }, [
      filter?.drug?.name,
      filter?.drug?.code,
      filter?.product?.name,
      filter?.product?.drug,
      filter?.product?.code,
      filter?.product?.type,
      filter?.package?.name,
      filter?.package?.product,
      filter?.package?.code,
      filter?.package?.type,
      first,
      after,
      filter
    ]);

    return {
      medications,
      loading,
      error,
      refetch: ({
        filter,
        first,
        after
      }: {
        filter?: MedicationFilter;
        first?: number;
        after?: string;
      }) => client.clinical.medication.getMedications({ filter, first, after })
    };
  };

  /// Medical Equipment

  const getMedicalEquipmentStore = map<{
    medicalEquipment: MedicalEquipment[];
    loading: boolean;
    error?: ApolloError;
  }>({
    medicalEquipment: [],
    loading: true,
    error: undefined
  });

  const fetchMedicalEquipment = action(
    getMedicalEquipmentStore,
    'fetchMedicalEquipment',
    async (store, { name, first, after }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.medicalEquipment.getMedicalEquipment({
        name,
        first,
        after
      });
      store.setKey('medicalEquipment', data?.medicalEquipment || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetMedicalEquipment = ({
    name,
    first,
    after
  }: {
    name?: string;
    first?: number;
    after?: string;
  }) => {
    const { medicalEquipment, loading, error } = useStore(getMedicalEquipmentStore);

    useEffect(() => {
      fetchMedicalEquipment({ name, first, after });
    }, [name, first, after]);

    return {
      medicalEquipment,
      loading,
      error,
      refetch: ({ name, first, after }: { name?: string; first?: number; after?: string }) =>
        client.clinical.medicalEquipment.getMedicalEquipment({
          name,
          first,
          after
        })
    };
  };

  /// Pharmacy

  const getPharmacyStore = map<{
    pharmacy?: Pharmacy;
    loading: boolean;
    error?: ApolloError;
  }>({
    pharmacy: undefined,
    loading: true,
    error: undefined
  });

  const fetchPharmacy = action(getPharmacyStore, 'fetchPharmacy', async (store, { id }) => {
    store.setKey('loading', true);
    const { data, error } = await client.clinical.pharmacy.getPharmacy({
      id
    });
    store.setKey('pharmacy', data?.pharmacy || undefined);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetPharmacy = ({ id }: { id: string }) => {
    const { pharmacy, loading, error } = useStore(getPharmacyStore);

    useEffect(() => {
      fetchPharmacy({ id });
    }, [id]);

    return {
      pharmacy,
      loading,
      error,
      refetch: ({ id }: { id: string }) => client.clinical.pharmacy.getPharmacy({ id })
    };
  };

  const getPharmaciesStore = map<{
    pharmacies: Pharmacy[];
    loading: boolean;
    error?: ApolloError;
  }>({
    pharmacies: [],
    loading: true,
    error: undefined
  });

  const fetchPharmacies = action(
    getPharmaciesStore,
    'fetchPharmacies',
    async (store, { name, type, location }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.pharmacy.getPharmacies({
        name,
        type,
        location
      });
      store.setKey('pharmacies', data?.pharmacies || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetPharmacies = ({
    name,
    location,
    type,
    after,
    first
  }: {
    name?: string;
    location?: LatLongSearch;
    type?: FulfillmentType;
    after?: number;
    first?: number;
  }) => {
    const { pharmacies, loading, error } = useStore(getPharmaciesStore);

    useEffect(() => {
      fetchPharmacies({ name, location, type, after, first });
    }, [
      name,
      location,
      location?.latitude,
      location?.longitude,
      location?.radius,
      type,
      after,
      first
    ]);

    return {
      pharmacies,
      loading,
      error,
      refetch: ({
        name,
        location,
        type,
        after,
        first
      }: {
        name?: string;
        location?: LatLongSearch;
        type?: FulfillmentType;
        after?: number;
        first?: number;
      }) =>
        client.clinical.pharmacy.getPharmacies({
          name,
          location,
          type,
          after,
          first
        })
    };
  };

  // Organization
  const getOrganizationStore = map<{
    organization?: Organization;
    loading: boolean;
    error?: ApolloError;
  }>({
    organization: undefined,
    loading: true,
    error: undefined
  });

  const fetchOrganization = action(getOrganizationStore, 'fetchOrganization', async (store) => {
    store.setKey('loading', true);
    const { data, error } = await client.management.organization.getOrganization();
    store.setKey('organization', data?.organization || undefined);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetOrganization = () => {
    const { organization, loading, error } = useStore(getOrganizationStore);

    useEffect(() => {
      fetchOrganization();
    }, []);

    return {
      organization,
      loading,
      error,
      refetch: () => client.management.organization.getOrganization()
    };
  };

  const getOrganizationsStore = map<{
    organizations: Organization[];
    loading: boolean;
    error?: ApolloError;
  }>({
    organizations: [],
    loading: true,
    error: undefined
  });

  const fetchOrganizations = action(getOrganizationsStore, 'fetchOrganizations', async (store) => {
    store.setKey('loading', true);
    const { data, error } = await client.management.organization.getOrganizations();
    store.setKey('organizations', data?.organizations || []);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetOrganizations = () => {
    const { organizations, loading, error } = useStore(getOrganizationsStore);

    useEffect(() => {
      fetchOrganizations();
    }, []);

    return {
      organizations,
      loading,
      error,
      refetch: () => client.management.organization.getOrganizations()
    };
  };

  // Webhooks

  const getWebhooksStore = map<{
    webhooks: WebhookConfig[];
    loading: boolean;
    error?: ApolloError;
  }>({
    webhooks: [],
    loading: true,
    error: undefined
  });

  const fetchWebhooks = action(getWebhooksStore, 'fetchWebhooks', async (store) => {
    store.setKey('loading', true);
    const { data, error } = await client.management.webhook.getWebhooks();
    store.setKey('webhooks', data?.webhooks || []);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetWebhooks = () => {
    const { webhooks, loading, error } = useStore(getWebhooksStore);

    useEffect(() => {
      fetchWebhooks();
    }, []);

    return {
      webhooks,
      loading,
      error,
      refetch: () => client.management.webhook.getWebhooks()
    };
  };

  const createWebhookStore = map<{
    createWebhook?: WebhookConfig;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    createWebhook: undefined,
    loading: false,
    error: undefined
  });

  const createWebhookMutation = client.management.webhook.createWebhook({});

  const constructFetchCreateWebhook = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) =>
    action(
      createWebhookStore,
      'createWebhookMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await createWebhookMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('createWebhook', data?.createWebhookConfig);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            runRefetch(refetchQueries);
          }
        } catch (err) {
          store.setKey('createWebhook', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useCreateWebhook = ({ refetchQueries = undefined }: { refetchQueries?: string[] }) => {
    const { createWebhook, loading, error } = useStore(createWebhookStore);

    return [
      constructFetchCreateWebhook({ refetchQueries }),
      {
        createWebhook,
        loading,
        error
      }
    ];
  };

  const deleteWebhookStore = map<{
    deleteWebhook?: boolean;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    deleteWebhook: undefined,
    loading: false,
    error: undefined
  });

  const deleteWebhookMutation = client.management.webhook.deleteWebhook();

  const constructFetchDeleteWebhook = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) =>
    action(
      deleteWebhookStore,
      'deleteWebhookMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await deleteWebhookMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('deleteWebhook', data?.deleteWebhookConfig);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            runRefetch(refetchQueries);
          }
        } catch (err) {
          store.setKey('deleteWebhook', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useDeleteWebhook = ({ refetchQueries = undefined }: { refetchQueries?: string[] }) => {
    const { deleteWebhook, loading, error } = useStore(deleteWebhookStore);

    return [
      constructFetchDeleteWebhook({ refetchQueries }),
      {
        deleteWebhook,
        loading,
        error
      }
    ];
  };

  /// Prescription Templates

  const createPrescriptionTemplateStore = map<{
    createPrescriptionTemplate?: PrescriptionTemplate;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    createPrescriptionTemplate: undefined,
    loading: false,
    error: undefined
  });

  const createPrescriptionTemplateMutation =
    client.clinical.prescriptionTemplate.createPrescriptionTemplate({});

  const constructFetchCreatePrescriptionTemplate = ({
    refetchQueries = undefined,
    refetchArgs
  }: {
    refetchQueries?: string[];
    refetchArgs: Record<string, any>;
  }) =>
    action(
      createPrescriptionTemplateStore,
      'createPrescriptionTemplateMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await createPrescriptionTemplateMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('createPrescriptionTemplate', data?.createPrescriptionTemplate);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            runRefetch(refetchQueries, refetchArgs);
          }
        } catch (err) {
          store.setKey('createPrescriptionTemplate', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useCreatePrescriptionTemplate = ({
    refetchQueries = undefined,
    refetchArgs
  }: {
    refetchQueries?: string[];
    refetchArgs: Record<string, any>;
  }) => {
    const { createPrescriptionTemplate, loading, error } = useStore(
      createPrescriptionTemplateStore
    );

    return [
      constructFetchCreatePrescriptionTemplate({ refetchQueries, refetchArgs }),
      {
        createPrescriptionTemplate,
        loading,
        error
      }
    ];
  };

  const updatePrescriptionTemplateStore = map<{
    updatePrescriptionTemplate?: PrescriptionTemplate;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    updatePrescriptionTemplate: undefined,
    loading: false,
    error: undefined
  });

  const updatePrescriptionTemplateMutation =
    client.clinical.prescriptionTemplate.updatePrescriptionTemplate({});

  const constructFetchUpdatePrescriptionTemplate = ({
    refetchQueries = undefined,
    refetchArgs
  }: {
    refetchQueries?: string[];
    refetchArgs: Record<string, any>;
  }) =>
    action(
      updatePrescriptionTemplateStore,
      'udpatePrescriptionTemplateMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await updatePrescriptionTemplateMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('updatePrescriptionTemplate', data?.updatePrescriptionTemplate);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            runRefetch(refetchQueries, refetchArgs);
          }
        } catch (err) {
          store.setKey('updatePrescriptionTemplate', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useUpdatePrescriptionTemplate = ({
    refetchQueries = undefined,
    refetchArgs
  }: {
    refetchQueries?: string[];
    refetchArgs: Record<string, any>;
  }) => {
    const { updatePrescriptionTemplate, loading, error } = useStore(
      updatePrescriptionTemplateStore
    );

    return [
      constructFetchUpdatePrescriptionTemplate({ refetchQueries, refetchArgs }),
      {
        updatePrescriptionTemplate,
        loading,
        error
      }
    ];
  };

  const deletePrescriptionTemplateStore = map<{
    deletePrescriptionTemplate?: PrescriptionTemplate;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    deletePrescriptionTemplate: undefined,
    loading: false,
    error: undefined
  });

  const deletePrescriptionTemplateMutation =
    client.clinical.prescriptionTemplate.deletePrescriptionTemplate({});

  const constructFetchDeletePrescriptionTemplate = ({
    refetchQueries = undefined,
    refetchArgs
  }: {
    refetchQueries?: string[];
    refetchArgs: Record<string, any>;
  }) =>
    action(
      deletePrescriptionTemplateStore,
      'deletePrescriptionTemplateMutation',
      async (store, { variables, onCompleted }) => {
        store.setKey('loading', true);

        try {
          const { data, errors } = await deletePrescriptionTemplateMutation({
            variables,
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          store.setKey('deletePrescriptionTemplate', data?.deletePrescriptionTemplate);
          store.setKey('error', errors?.[0]);
          if (onCompleted) {
            onCompleted(data);
          }
          if (refetchQueries && refetchQueries.length > 0) {
            runRefetch(refetchQueries, refetchArgs);
          }
        } catch (err) {
          store.setKey('deletePrescriptionTemplate', undefined);
          store.setKey('error', err as GraphQLFormattedError);
        }

        store.setKey('loading', false);
      }
    );

  const useDeletePrescriptionTemplate = ({
    refetchQueries = undefined,
    refetchArgs
  }: {
    refetchQueries?: string[];
    refetchArgs: Record<string, any>;
  }) => {
    const { deletePrescriptionTemplate, loading, error } = useStore(
      deletePrescriptionTemplateStore
    );

    return [
      constructFetchDeletePrescriptionTemplate({ refetchQueries, refetchArgs }),
      {
        deletePrescriptionTemplate,
        loading,
        error
      }
    ];
  };

  /// SearchMedication

  const getMedicationConceptsStore = map<{
    medicationConcepts: SearchMedication[];
    loading: boolean;
    error?: ApolloError;
  }>({
    medicationConcepts: [],
    loading: false,
    error: undefined
  });

  const fetchMedicationConcepts = action(
    getMedicationConceptsStore,
    'fetchMedicationConcepts',
    async (store, { name }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.searchMedication.getConcepts({
        name
      });
      store.setKey('medicationConcepts', data?.medicationConcepts || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetMedicationConcepts = (
    {
      name,
      defer
    }: {
      name: string;
      defer?: boolean;
    } = {
      name: '',
      defer: false
    }
  ) => {
    const { medicationConcepts, loading, error } = useStore(getMedicationConceptsStore);

    useEffect(() => {
      if (!defer) {
        fetchMedicationConcepts({ name });
      }
    }, [name, defer]);

    return {
      medicationConcepts,
      loading,
      error,
      refetch: ({ name }: { name: string }) =>
        client.clinical.searchMedication.getConcepts({ name }),
      query: defer
        ? async ({ name }: { name: string }) => {
            await fetchMedicationConcepts({ name });
            return {
              medicationConcepts,
              loading,
              error
            };
          }
        : undefined
    };
  };

  const getMedicationStrengthsStore = map<{
    medicationStrengths: SearchMedication[];
    loading: boolean;
    error?: ApolloError;
  }>({
    medicationStrengths: [],
    loading: false,
    error: undefined
  });

  const fetchMedicationStrengths = action(
    getMedicationStrengthsStore,
    'fetchMedicationStrengths',
    async (store, { id }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.searchMedication.getStrengths({
        id
      });
      store.setKey('medicationStrengths', data?.medicationStrengths || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetMedicationStrengths = ({ id, defer }: { id: string; defer?: boolean }) => {
    const { medicationStrengths, loading, error } = useStore(getMedicationStrengthsStore);

    useEffect(() => {
      if (!defer) {
        fetchMedicationStrengths({ id });
      }
    }, [id, defer]);

    return {
      medicationStrengths,
      loading,
      error,
      refetch: ({ id }: { id: string }) => client.clinical.searchMedication.getStrengths({ id }),
      query: defer
        ? async ({ id }: { id: string }) => {
            await fetchMedicationStrengths({ id });
            return {
              medicationStrengths,
              loading,
              error
            };
          }
        : undefined
    };
  };

  const getMedicationRoutesStore = map<{
    medicationRoutes: SearchMedication[];
    loading: boolean;
    error?: ApolloError;
  }>({
    medicationRoutes: [],
    loading: false,
    error: undefined
  });

  const fetchMedicationRoutes = action(
    getMedicationRoutesStore,
    'fetchMedicationRoutes',
    async (store, { id }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.searchMedication.getRoutes({
        id
      });
      store.setKey('medicationRoutes', data?.medicationRoutes || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetMedicationRoutes = ({ id, defer }: { id: string; defer?: boolean }) => {
    const { medicationRoutes, loading, error } = useStore(getMedicationRoutesStore);

    useEffect(() => {
      if (!defer) {
        fetchMedicationRoutes({ id });
      }
    }, [id, defer]);

    return {
      medicationRoutes,
      loading,
      error,
      refetch: ({ id }: { id: string }) => client.clinical.searchMedication.getRoutes({ id }),
      query: defer
        ? async ({ id }: { id: string }) => {
            await fetchMedicationRoutes({ id });
            return {
              medicationRoutes,
              loading,
              error
            };
          }
        : undefined
    };
  };

  const getMedicationFormsStore = map<{
    medicationForms: Medication[];
    loading: boolean;
    error?: ApolloError;
  }>({
    medicationForms: [],
    loading: false,
    error: undefined
  });

  const fetchMedicationForms = action(
    getMedicationFormsStore,
    'fetchMedicationForms',
    async (store, { id }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.searchMedication.getForms({
        id
      });
      store.setKey('medicationForms', data?.medicationForms || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetMedicationForms = ({ id, defer }: { id: string; defer?: boolean }) => {
    const { medicationForms, loading, error } = useStore(getMedicationFormsStore);

    useEffect(() => {
      if (!defer) {
        fetchMedicationForms({ id });
      }
    }, [id, defer]);

    return {
      medicationForms,
      loading,
      error,
      refetch: ({ id }: { id: string }) => client.clinical.searchMedication.getForms({ id }),
      query: defer
        ? async ({ id }: { id: string }) => {
            await fetchMedicationForms({ id });
            return {
              medicationForms,
              loading,
              error
            };
          }
        : undefined
    };
  };

  const getMedicationProductsStore = map<{
    medicationProducts: Medication[];
    loading: boolean;
    error?: ApolloError;
  }>({
    medicationProducts: [],
    loading: false,
    error: undefined
  });

  const fetchMedicationProducts = action(
    getMedicationProductsStore,
    'fetchMedicationProducts',
    async (store, { id }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.searchMedication.getProducts({
        id
      });
      store.setKey('medicationProducts', data?.medicationProducts || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetMedicationProducts = ({ id, defer }: { id: string; defer?: boolean }) => {
    const { medicationProducts, loading, error } = useStore(getMedicationProductsStore);

    useEffect(() => {
      if (!defer) {
        fetchMedicationProducts({ id });
      }
    }, [id, defer]);

    return {
      medicationProducts,
      loading,
      error,
      refetch: ({ id }: { id: string }) => client.clinical.searchMedication.getProducts({ id }),
      query: defer
        ? async ({ id }: { id: string }) => {
            await fetchMedicationProducts({ id });
            return {
              medicationProducts,
              loading,
              error
            };
          }
        : undefined
    };
  };

  const getMedicationPackagesStore = map<{
    medicationPackages: Medication[];
    loading: boolean;
    error?: ApolloError;
  }>({
    medicationPackages: [],
    loading: false,
    error: undefined
  });

  const fetchMedicationPackages = action(
    getMedicationPackagesStore,
    'fetchMedicationPackages',
    async (store, { id }) => {
      store.setKey('loading', true);
      const { data, error } = await client.clinical.searchMedication.getPackages({
        id
      });
      store.setKey('medicationPackages', data?.medicationPackages || []);
      store.setKey('error', error);
      store.setKey('loading', false);
    }
  );

  const useGetMedicationPackages = ({ id, defer }: { id: string; defer?: boolean }) => {
    const { medicationPackages, loading, error } = useStore(getMedicationPackagesStore);

    useEffect(() => {
      if (!defer) {
        fetchMedicationPackages({ id });
      }
    }, [id, defer]);

    return {
      medicationPackages,
      loading,
      error,
      refetch: ({ id }: { id: string }) => client.clinical.searchMedication.getPackages({ id }),
      query: defer
        ? async ({ id }: { id: string }) => {
            await fetchMedicationProducts({ id });
            return {
              medicationPackages,
              loading,
              error
            };
          }
        : undefined
    };
  };

  /// Clients

  const getClientsStore = map<{
    clients: Client[];
    loading: boolean;
    error?: ApolloError;
  }>({
    clients: [],
    loading: true,
    error: undefined
  });

  const fetchClients = action(getClientsStore, 'fetchClients', async (store) => {
    store.setKey('loading', true);
    const { data, error } = await client.management.client.getClients();
    store.setKey('clients', data?.clients || []);
    store.setKey('error', error);
    store.setKey('loading', false);
  });

  const useGetClients = () => {
    const { clients, loading, error } = useStore(getClientsStore);

    useEffect(() => {
      fetchClients();
    }, []);

    return {
      clients,
      loading,
      error,
      refetch: () => client.management.client.getClients()
    };
  };

  const rotateSecretStore = map<{
    rotateSecret?: Client;
    loading: boolean;
    error?: GraphQLFormattedError;
  }>({
    rotateSecret: undefined,
    loading: false,
    error: undefined
  });

  const rotateSecretMutation = client.management.client.rotateSecret({});

  const constructFetchRotateSecret = ({
    refetchQueries = undefined
  }: {
    refetchQueries?: string[];
  }) =>
    action(rotateSecretStore, 'rotateSecretMutation', async (store, { variables, onCompleted }) => {
      store.setKey('loading', true);

      try {
        const { data, errors } = await rotateSecretMutation({
          variables,
          refetchQueries: [],
          awaitRefetchQueries: false
        });
        store.setKey('rotateSecret', data?.rotateSecret);
        store.setKey('error', errors?.[0]);
        if (onCompleted) {
          onCompleted(data);
        }
        if (refetchQueries && refetchQueries.length > 0) {
          runRefetch(refetchQueries);
        }
      } catch (err) {
        store.setKey('rotateSecret', undefined);
        store.setKey('error', err as GraphQLFormattedError);
      }

      store.setKey('loading', false);
    });

  const useRotateSecret = ({ refetchQueries = undefined }: { refetchQueries?: string[] }) => {
    const { rotateSecret, loading, error } = useStore(rotateSecretStore);

    return [
      constructFetchRotateSecret({ refetchQueries }),
      {
        rotateSecret,
        loading,
        error
      }
    ];
  };

  functionLookup.getWebhooks = fetchWebhooks;
  functionLookup.getOrders = fetchOrders;
  functionLookup.getPatients = fetchPatients;
  functionLookup.getPrescriptions = fetchPrescriptions;
  functionLookup.getClients = fetchClients;
  functionLookup.getCatalog = fetchCatalog;

  const setOrganization = (organizationId: string) => {
    client.setOrganization(organizationId);
  };

  const clearOrganization = () => {
    client.clearOrganization();
  };

  const contextValue = {
    ...state,
    env: opts.env,
    clinicalClient: client.apolloClinical,
    login,
    logout,
    getToken,
    handleRedirect,
    getPatient: useGetPatient,
    getPatients: useGetPatients,
    createPatient: useCreatePatient,
    getOrder: useGetOrder,
    getOrders: useGetOrders,
    createOrder: useCreateOrder,
    getPrescription: useGetPrescription,
    getPrescriptions: useGetPrescriptions,
    createPrescription: useCreatePrescription,
    createPrescriptionTemplate: useCreatePrescriptionTemplate,
    updatePrescriptionTemplate: useUpdatePrescriptionTemplate,
    getCatalog: useGetCatalog,
    getCatalogs: useGetCatalogs,
    getMedications: useGetMedications,
    getMedicalEquipment: useGetMedicalEquipment,
    getOrganizations: useGetOrganizations,
    getOrganization: useGetOrganization,
    getWebhooks: useGetWebhooks,
    createWebhook: useCreateWebhook,
    deleteWebhook: useDeleteWebhook,
    getPharmacies: useGetPharmacies,
    getPharmacy: useGetPharmacy,
    getClients: useGetClients,
    rotateSecret: useRotateSecret,
    clearError,
    updatePatient: useUpdatePatient,
    getAllergens: useGetAllergens,
    removePatientAllergy: useRemovePatientAllergy,
    removePatientPreferredPharmacy: useRemovePatientPreferredPharmacy,
    getDispenseUnits: useGetDispenseUnits,
    setOrganization,
    clearOrganization,
    addToCatalog: useAddToCatalog,
    getMedicationConcepts: useGetMedicationConcepts,
    getMedicationStrengths: useGetMedicationStrengths,
    getMedicationRoutes: useGetMedicationRoutes,
    getMedicationForms: useGetMedicationForms,
    getMedicationProducts: useGetMedicationProducts,
    getMedicationPackages: useGetMedicationPackages,
    removeFromCatalog: useRemoveFromCatalog,
    deletePrescriptionTemplate: useDeletePrescriptionTemplate
  };

  return (
    <ApolloProvider client={client.apollo}>
      <PhotonClientContext.Provider value={contextValue}>{children}</PhotonClientContext.Provider>
    </ApolloProvider>
  );
};

export const usePhoton = () => useContext(PhotonClientContext);
