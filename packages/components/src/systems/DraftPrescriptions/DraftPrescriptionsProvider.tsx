import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSXElement,
  Setter,
  useContext
} from 'solid-js';
import {
  MutationCreatePrescriptionsArgs,
  Prescription,
  PrescriptionState
} from '@photonhealth/sdk/dist/types';
import { DraftPrescriptionSource, PhotonClient } from '@photonhealth/sdk';
import { buildPrescriptionSnapshot } from '../../analytics/buildFieldSnapshot';
import { usePrescribeEventDispatch } from '../PrescribeEventDispatchProvider';
import { useRecentOrders } from '../RecentOrders';
import { usePhotonClient } from '../SDKProvider';
import {
  CreatePrescription,
  CreatePrescriptions,
  CreatePrescriptionTemplate,
  GetPrescription,
  UpdatePrescriptionStates
} from '../../fetch';
import triggerToast from '../../utils/toastTriggers';

export type DraftPrescriptionsContextType = {
  // values
  draftPrescriptions: Accessor<Prescription[]>;
  prescriptionIds: Accessor<string[]>;
  isLoadingPrefills: Accessor<boolean>;

  // actions
  setDraftPrescriptions: Setter<Prescription[]>;
  tryCreatePrescription: (
    prescriptionFormData: PrescriptionFormData,
    options?: TryCreatePrescriptionTemplateOptions,
    draftPrescriptionSource?: DraftPrescriptionSource
  ) => Promise<Prescription>;
  deletePrescription: (id: string) => void;
  tryUpdatePrescriptionStates: (ids: string[], state: PrescriptionState) => Promise<boolean>;
};

const DraftPrescriptionsContext = createContext<DraftPrescriptionsContextType>();

interface DraftPrescriptionProviderProps {
  children: JSXElement;
  patientId: string;
  templateIdsPrefill: string[];
  templateOverrides: TemplateOverrides;
  prescriptionIdsPrefill: string[];
  enableCombineAndDuplicate: boolean;
}

export type TemplateOverrides = {
  [key: string]: {
    daysSupply?: number;
    dispenseAsWritten?: boolean;
    dispenseQuantity?: number;
    dispenseUnit?: string;
    fillsAllowed?: number;
    instructions?: string;
    notes?: string;
    externalId?: string;
  };
};

export type PrescriptionFormData = {
  id?: string;
  doNotFillBeforeDate?: string;
  treatment: {
    id: string;
    name: string;
  };
  dispenseAsWritten: boolean;
  dispenseQuantity?: number;
  dispenseUnit?: string;
  daysSupply?: number;
  instructions: string;
  notes: string;
  fillsAllowed?: number;
  catalogId?: string;
  externalId?: string;
  diagnoseCodes: string[];
};

const transformPrescriptionFormData = (prescription: PrescriptionFormData, patientId: string) => ({
  externalId: prescription.externalId,
  patientId: patientId,
  treatmentId: prescription.treatment?.id,
  dispenseAsWritten: prescription.dispenseAsWritten,
  dispenseQuantity: prescription.dispenseQuantity,
  dispenseUnit: prescription.dispenseUnit,
  fillsAllowed: prescription.fillsAllowed,
  daysSupply: prescription.daysSupply,
  instructions: prescription.instructions,
  notes: prescription.notes,
  doNotFillBeforeDate: prescription.doNotFillBeforeDate,
  diagnoses: prescription.diagnoseCodes
});

export type TryCreatePrescriptionTemplateOptions = {
  addToTemplates?: boolean;
  templateName?: string;
  catalogId?: string;
  showSuccessToast?: boolean;
};

function isTreatmentInDraftPrescriptions(
  treatmentId: string,
  draftedPrescriptions: { treatment: { id: string } }[]
) {
  return draftedPrescriptions.some((draft) => draft.treatment.id === treatmentId);
}

const createPrefillPrescriptionsOnApi = async ({
  client,
  props
}: {
  client: PhotonClient;
  props: DraftPrescriptionProviderProps;
}) => {
  let rxToCreate: MutationCreatePrescriptionsArgs['prescriptions'] = [];

  // Create prescriptions from template ids with a few optional override values
  if (props.templateIdsPrefill.length > 0) {
    const dedupedTemplateIds = Array.from(new Set(props.templateIdsPrefill));
    const templatedCreateRxList = dedupedTemplateIds.map((templateId) => ({
      ...props.templateOverrides?.[templateId],
      patientId: props.patientId,
      templateId
    }));
    rxToCreate = rxToCreate.concat(templatedCreateRxList);
  }

  // Fetch prescriptions if needed
  if (props.prescriptionIdsPrefill.length > 0) {
    const fetchedPrescriptions = await Promise.all(
      props.prescriptionIdsPrefill.map(async (prescriptionId: string) => {
        const { data } = await client.apollo.query({
          query: GetPrescription,
          variables: { id: prescriptionId }
        });
        return transformPrescriptionFormData(data?.prescription, props.patientId);
      })
    );
    rxToCreate = rxToCreate.concat(fetchedPrescriptions);
  }

  if (!rxToCreate.length) {
    return;
  }

  const res = await client.apollo.mutate({
    mutation: CreatePrescriptions,
    variables: { prescriptions: rxToCreate }
  });
  const newRxs = res.data.createPrescriptions as Prescription[];
  return newRxs;
};

export const DraftPrescriptionsProvider = (props: DraftPrescriptionProviderProps) => {
  const { dispatchDraftPrescriptionCreated, dispatchAnalyticsTrackEvent } =
    usePrescribeEventDispatch();
  const [, recentOrdersActions] = useRecentOrders();
  const client = usePhotonClient();
  const [hasCreatedPrescriptions, setHasCreatedPrescriptions] = createSignal<boolean>(false);
  const [isLoadingPrefills, setIsLoadingPrefills] = createSignal<boolean>(false);
  const [draftPrescriptions, setDraftPrescriptions] = createSignal<Prescription[]>([]);

  const prescriptionIds = createMemo(() =>
    draftPrescriptions().map((prescription) => prescription.id)
  );

  // Prefill new prescriptions based on templateIds or prescriptionIds when we get a patientId
  createEffect(async () => {
    if (
      // must have templateIds or prescriptionIds to create prescriptions
      (props.templateIdsPrefill.length > 0 || props.prescriptionIdsPrefill.length > 0) &&
      // must have a patientId
      !!props.patientId &&
      // must not have created prescriptions yet
      !hasCreatedPrescriptions()
    ) {
      setHasCreatedPrescriptions(true);
      setIsLoadingPrefills(true);

      try {
        const newRxs = await createPrefillPrescriptionsOnApi({ client, props });
        if (newRxs) {
          setDraftPrescriptions((prev) => [...prev, ...newRxs]);
          newRxs.forEach((rx) => {
            dispatchDraftPrescriptionCreated(rx);
            dispatchAnalyticsTrackEvent('ctaClicked', {
              name: 'Draft Prescription Added',
              draftPrescriptionSource: 'prefill',
              fields: buildPrescriptionSnapshot(rx)
            });
          });
        }
      } catch (error) {
        console.error('Error while trying to create prescriptions from prefill IDs', { error });
        triggerToast({
          status: 'error',
          body: 'There was an issue creating prescriptions from prefill IDs. Please check your configuration.'
        });
      } finally {
        setIsLoadingPrefills(false);
      }
    }
  });

  const tryCreatePrescription = async (
    prescriptionFormData: PrescriptionFormData,
    options: TryCreatePrescriptionTemplateOptions = { showSuccessToast: true },
    draftPrescriptionSource: DraftPrescriptionSource = 'form'
  ): Promise<Prescription> => {
    const isPrescriptionAlreadyAdded = isTreatmentInDraftPrescriptions(
      prescriptionFormData.treatment.id,
      draftPrescriptions()
    );

    if (isPrescriptionAlreadyAdded) {
      triggerToast({
        status: 'error',
        body: 'You already have this prescription in your order. You can modify the prescription or delete it in Pending Order.'
      });

      throw new Error('Prescription already added');
    }

    const duplicateFill = recentOrdersActions.checkDuplicateFill(
      prescriptionFormData.treatment.name
    );

    if (props.enableCombineAndDuplicate && duplicateFill) {
      // if there's a duplicate order, check first if they want to report an issue
      await new Promise<void>((resolve, reject) => {
        recentOrdersActions.setIsDuplicateDialogOpen(true, duplicateFill, resolve, reject);
      });
    }

    return await createPrescriptionOnApi(prescriptionFormData, options, draftPrescriptionSource);
  };

  const createPrescriptionOnApi = async (
    prescriptionFormData: PrescriptionFormData,
    options: TryCreatePrescriptionTemplateOptions = {
      addToTemplates: false,
      showSuccessToast: true
    },
    draftPrescriptionSource: DraftPrescriptionSource = 'form'
  ): Promise<Prescription> => {
    let createdPrescription: Prescription | null = null;

    try {
      const res = await client.apollo.mutate({
        mutation: CreatePrescription,
        variables: transformPrescriptionFormData(prescriptionFormData, props.patientId)
      });
      const created = res.data.createPrescription as Prescription;
      createdPrescription = created;
      setDraftPrescriptions((prev) => [...prev, created]);
      dispatchDraftPrescriptionCreated(created);
      dispatchAnalyticsTrackEvent('ctaClicked', {
        name: 'Draft Prescription Added',
        draftPrescriptionSource: draftPrescriptionSource,
        fields: buildPrescriptionSnapshot(prescriptionFormData, {
          addToTemplates: options?.addToTemplates,
          templateName: options?.templateName
        })
      });
    } catch (e) {
      console.error('Mutation error:', e);
      const message = (e as Error).message;
      triggerToast({
        status: 'error',
        header: 'Error Adding Prescription',
        body: message.includes('controlled substance')
          ? message
          : 'There was an issue adding the prescription. Please try again.'
      });
      throw e;
    }

    if (options?.addToTemplates && options?.catalogId != null) {
      await createPrescriptionTemplateOnApi(
        prescriptionFormData,
        options.catalogId,
        options.templateName
      );

      if (options.showSuccessToast) {
        triggerToast({
          status: 'success',
          header: 'Personal Template Saved'
        });
      }
    }

    if (options.showSuccessToast) {
      triggerToast({
        status: 'success',
        header: 'Prescription Added',
        body: 'You can send this order or add another prescription before sending it'
      });
    }

    return createdPrescription;
  };

  const createPrescriptionTemplateOnApi = async (
    prescription: PrescriptionFormData,
    catalogId: string,
    templateName = ''
  ) => {
    const res = await client.apollo.mutate({
      mutation: CreatePrescriptionTemplate,
      variables: {
        ...transformPrescriptionFormData(prescription, props.patientId),
        catalogId,
        isPrivate: true,
        ...(templateName ? { name: templateName } : {})
      }
    });
    return res;
  };

  const deletePrescription = (toDeleteId: string) => {
    setDraftPrescriptions((prev) => prev.filter((rx) => rx.id !== toDeleteId));
  };

  const tryUpdatePrescriptionStates = async (
    ids: string[],
    state: PrescriptionState
  ): Promise<boolean> => {
    try {
      const res = await client.apolloClinical.mutate({
        mutation: UpdatePrescriptionStates,
        variables: {
          input: {
            ids,
            state
          }
        }
      });

      return res.data.updatePrescriptionStates as boolean;
    } catch (error) {
      console.error('Mutation error:', error);
      triggerToast({
        status: 'error',
        header: 'Error Saving Prescription(s)',
        body: (error as Error).message
      });
      throw error;
    }
  };

  const value = {
    // values
    draftPrescriptions,
    prescriptionIds,
    isLoadingPrefills,

    // actions
    setDraftPrescriptions,
    tryCreatePrescription,
    tryUpdatePrescriptionStates,
    deletePrescription
  };

  return (
    <DraftPrescriptionsContext.Provider value={value}>
      {props.children}
    </DraftPrescriptionsContext.Provider>
  );
};

export const useDraftPrescriptions = () => {
  const context = useContext(DraftPrescriptionsContext);
  if (!context) {
    throw new Error("can't find DraftPrescriptionsContext");
  }
  return context;
};

export const useDraftPrescriptionsOptional = () => {
  return useContext(DraftPrescriptionsContext);
};
