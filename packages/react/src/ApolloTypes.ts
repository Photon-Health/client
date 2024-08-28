/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApolloClient, ApolloError, NormalizedCacheObject } from '@apollo/client';
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
import { DocumentNode, GraphQLError } from 'graphql';
import { PhotonClient } from '@photonhealth/sdk';

type ApolloReturn<Return extends Record<string, unknown>, Refetch> = Partial<Return> & {
  loading: boolean;
  error?: ApolloError;
  refetch: Refetch;
};

type ApolloReturnWithQuery<
  Return extends Record<string, unknown>,
  Refetch,
  QueryArgs
> = ApolloReturn<Return, Refetch> & {
  query: (args: QueryArgs) => Promise<
    Return & {
      loading: boolean;
      error?: ApolloError;
    }
  >;
};

type ApolloMutationHookCaller<ReturnData extends Record<string, unknown>, Vars> = ({
  variables,
  onCompleted
}: {
  variables: Vars;
  onCompleted?: (data: Maybe<ReturnData>) => void | undefined;
}) => Promise<void>;

type ApolloMutationHookReturn<ReturnData extends Record<string, unknown>> = {
  data: Maybe<ReturnData>;
  error: GraphQLError;
  loading: boolean;
};

type ApolloMutationHook<ReturnData extends Record<string, unknown>, Vars> = ({
  refetchQueries,
  awaitRefetchQueries
}: {
  refetchQueries: string[];
  awaitRefetchQueries?: boolean;
}) => [ApolloMutationHookCaller<ReturnData, Vars>, ApolloMutationHookReturn<ReturnData>];

type ApolloMutationHookWithRefetchArgs<
  ReturnData extends Record<string, unknown>,
  Vars,
  RefetchArgs
> = (args: {
  refetchQueries: string[];
  awaitRefetchQueries?: boolean;
  refetchArgs?: RefetchArgs;
}) => [ApolloMutationHookCaller<ReturnData, Vars>, ApolloMutationHookReturn<ReturnData>];

export type GetCatalogReturn = ApolloReturnWithQuery<
  { catalog: Catalog },
  PhotonClient['clinical']['catalog']['getCatalog'],
  { id: string; fragment?: Record<string, DocumentNode> }
>;

export type GetMedicationReturn = ApolloReturn<
  { medications?: Medication[] },
  PhotonClient['clinical']['medication']['getMedications']
>;

export type GetMedicalEquipmentReturn = ApolloReturn<
  { medicalEquipment?: MedicalEquipment[] },
  PhotonClient['clinical']['medicalEquipment']['getMedicalEquipment']
>;

export type GetAllergensReturn = ApolloReturn<
  { allergens?: Allergen[] },
  PhotonClient['clinical']['allergens']['getAllergens']
>;

export interface PhotonClientContextInterface {
  clinicalClient: ApolloClient<NormalizedCacheObject> | undefined;
  getPatient: (args: {
    id: string;
    fragment?: Record<string, DocumentNode>;
  }) => ApolloReturn<{ patient?: Patient }, PhotonClient['clinical']['patient']['getPatient']>;

  getDispenseUnits: () => ApolloReturn<
    { dispenseUnits?: DispenseUnit[] },
    PhotonClient['clinical']['prescription']['getDispenseUnits']
  >;

  getPatients: (args: {
    after?: Maybe<string>;
    first?: Maybe<number>;
    name?: Maybe<string>;
  }) => ApolloReturn<{ patients?: Patient[] }, PhotonClient['clinical']['patient']['getPatients']>;

  createPatient: ApolloMutationHook<{ createPatient: Patient }, object>;

  updatePatient: ApolloMutationHook<{ updatePatient: Patient }, object>;

  removePatientAllergy: ApolloMutationHook<{ removePatientAllergy: Patient }, object>;

  removePatientPreferredPharmacy: ApolloMutationHook<
    { removePatientPreferredPharmacy: Patient },
    object
  >;

  getOrder: (args: {
    id: string;
  }) => ApolloReturn<{ order: Order }, PhotonClient['clinical']['order']['getOrder']>;

  getOrders: (args: {
    after?: Maybe<string>;
    first?: Maybe<number>;
    patientId?: Maybe<string>;
    patientName?: Maybe<string>;
  }) => ApolloReturn<{ orders: Order[] }, PhotonClient['clinical']['order']['getOrders']>;

  createOrder: ApolloMutationHook<{ createOrder: Order }, object>;

  addToCatalog: ApolloMutationHookWithRefetchArgs<
    { addToCatalog: Treatment },
    object,
    Record<string, any>
  >;

  removeFromCatalog: ApolloMutationHookWithRefetchArgs<
    { removeFromCatalog: Treatment },
    object,
    Record<string, any>
  >;

  createPrescriptionTemplate: ApolloMutationHookWithRefetchArgs<
    { createPrescriptionTemplate: PrescriptionTemplate },
    object,
    Record<string, any>
  >;

  updatePrescriptionTemplate: ApolloMutationHookWithRefetchArgs<
    { updatePrescriptionTemplate: PrescriptionTemplate },
    object,
    Record<string, any>
  >;

  deletePrescriptionTemplate: ApolloMutationHookWithRefetchArgs<
    { deletePrescriptionTemplate: PrescriptionTemplate },
    object,
    Record<string, any>
  >;

  getPrescription: (args: {
    id: string;
  }) => ApolloReturn<
    { prescription?: Prescription },
    PhotonClient['clinical']['prescription']['getPrescription']
  >;

  getMedicationConcepts: (args: {
    name: string;
    defer?: boolean;
  }) => ApolloReturnWithQuery<
    { medicationConcepts?: SearchMedication[] },
    PhotonClient['clinical']['searchMedication']['getConcepts'],
    { name: string }
  >;
  getMedicationStrengths: (args: {
    id: string;
    defer?: boolean;
  }) => ApolloReturnWithQuery<
    { medicationStrengths: SearchMedication[] },
    PhotonClient['clinical']['searchMedication']['getStrengths'],
    { id: string }
  >;

  getMedicationRoutes: (args: {
    id: string;
    defer?: boolean;
  }) => ApolloReturnWithQuery<
    { medicationRoutes: SearchMedication[] },
    PhotonClient['clinical']['searchMedication']['getRoutes'],
    { id: string }
  >;

  getMedicationForms: (args: {
    id: string;
    defer?: boolean;
  }) => ApolloReturnWithQuery<
    { medicationForms: Medication[] },
    PhotonClient['clinical']['searchMedication']['getForms'],
    { id: string }
  >;

  getMedicationProducts: (args: {
    id: string;
    defer?: boolean;
  }) => ApolloReturnWithQuery<
    { medicationProducts: Medication[] },
    PhotonClient['clinical']['searchMedication']['getProducts'],
    { id: string }
  >;

  getMedicationPackages: (args: {
    id: string;
    defer?: boolean;
  }) => ApolloReturnWithQuery<
    { medicationPackages: Medication[] },
    PhotonClient['clinical']['searchMedication']['getPackages'],
    { id: string }
  >;

  getPrescriptions: (args: {
    patientId?: Maybe<string>;
    patientName?: Maybe<string>;
    prescriberId?: Maybe<string>;
    state?: Maybe<PrescriptionState>;
    after?: Maybe<string>;
    first?: Maybe<number>;
  }) => ApolloReturn<
    { prescriptions: Prescription[] },
    PhotonClient['clinical']['prescription']['getPrescriptions']
  >;

  createPrescription: ApolloMutationHook<{ createPrescription: Prescription }, object>;

  getCatalog: (args: {
    id: string;
    fragment?: Record<string, DocumentNode>;
    defer?: boolean;
  }) => GetCatalogReturn;

  getCatalogs: () => ApolloReturn<
    { catalogs: Catalog[] },
    PhotonClient['clinical']['catalog']['getCatalogs']
  >;

  getMedications: (args: {
    filter?: MedicationFilter;
    first?: number;
    after?: string;
  }) => GetMedicationReturn;

  getMedicalEquipment: (args: {
    name?: string;
    first?: number;
    after?: string;
  }) => GetMedicalEquipmentReturn;

  getAllergens: (args: { filter?: AllergenFilter }) => GetAllergensReturn;

  getPharmacy: (args: {
    id: string;
  }) => ApolloReturn<{ pharmacy: Pharmacy }, PhotonClient['clinical']['pharmacy']['getPharmacy']>;

  getPharmacies: (args: {
    name?: Maybe<string>;
    type?: Maybe<FulfillmentType>;
    location?: Maybe<LatLongSearch>;
  }) => ApolloReturn<
    { pharmacies: Pharmacy[] },
    PhotonClient['clinical']['pharmacy']['getPharmacies']
  >;

  getOrganization: () => ApolloReturn<
    { organization?: Organization },
    PhotonClient['management']['organization']['getOrganization']
  >;

  getOrganizations: () => ApolloReturn<
    { organizations?: Organization[] },
    PhotonClient['management']['organization']['getOrganizations']
  >;

  getWebhooks: () => ApolloReturn<
    { webhooks: WebhookConfig[] },
    PhotonClient['management']['webhook']['getWebhooks']
  >;

  createWebhook: ApolloMutationHook<{ createWebhook: WebhookConfig }, object>;
  deleteWebhook: ApolloMutationHook<{ deleteWebhook: boolean }, object>;

  getClients: () => ApolloReturn<
    { clients: Client[] },
    PhotonClient['management']['client']['getClients']
  >;

  rotateSecret: ApolloMutationHook<{ rotateSecret: Client }, object>;

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
