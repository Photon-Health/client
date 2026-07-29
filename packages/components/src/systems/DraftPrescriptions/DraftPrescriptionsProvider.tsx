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
import { constructRxNotes, formatPatientWeight } from './utils/formatters';

export type DraftPrescriptionsContextType = {
  // values
  draftPrescriptions: Accessor<Prescription[]>;
  prescriptionIds: Accessor<string[]>;
  isLoadingPrefills: Accessor<boolean>;
  rxNotesPrefill: Accessor<string | undefined>;

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
  prescriptionOverrides: PrescriptionOverrides;
  enableCombineAndDuplicate: boolean;
  additionalNotes?: string;
  weight?: number;
  weightUnit?: string;
}

export type TemplateOverrides = {
  [templateId: string]: {
    externalId?: string;
    dispenseQuantity?: number;
    dispenseUnit?: string;
    dispenseAsWritten?: boolean;
    fillsAllowed?: number;
    daysSupply?: number;
    instructions?: string;
    notes?: string;
  };
};

export type PrescriptionOverrides = {
  [prescriptionId: string]: {
    externalId?: string;
    treatmentId?: string;
    dispenseQuantity?: number;
    dispenseUnit?: string;
    dispenseAsWritten?: boolean;
    fillsAllowed?: number;
    daysSupply?: number;
    instructions?: string;
    notes?: string;
    doNotFillBeforeDate?: Date;
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

const mapFormDataToPrescriptionInput = (
  prescription: PrescriptionFormData,
  treatmentId: string,
  patientId: string
) => ({
  externalId: prescription.externalId,
  patientId: patientId,
  treatmentId: treatmentId,
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

const transformPrefillsToPrescriptionInputs = async ({
  client,
  patientId,
  templateIdsPrefill,
  templateOverrides,
  prescriptionIdsPrefill,
  prescriptionOverrides,
  rxNotesPrefill
}: {
  client: PhotonClient;
  patientId: string;
  templateIdsPrefill: string[];
  templateOverrides: TemplateOverrides;
  prescriptionIdsPrefill: string[];
  prescriptionOverrides: PrescriptionOverrides;
  rxNotesPrefill: string;
}) => {
  const rxToCreate: MutationCreatePrescriptionsArgs['prescriptions'] = [];

  // Create prescriptions from template ids with a few optional override values
  if (templateIdsPrefill.length > 0) {
    const dedupedTemplateIds = Array.from(new Set(templateIdsPrefill));
    const templatedCreateRxList = dedupedTemplateIds.map((templateId) => {
      return {
        ...templateOverrides?.[templateId],
        patientId: patientId,
        templateId,
        notes: constructRxNotes(
          null,
          templateOverrides?.[templateId]?.notes || null,
          rxNotesPrefill
        )
      };
    });
    rxToCreate.push(...templatedCreateRxList);
  }

  // Fetch prescriptions if needed
  if (prescriptionIdsPrefill.length > 0) {
    const fetchedPrescriptions = await Promise.all(
      prescriptionIdsPrefill.map(async (prescriptionId: string) => {
        const { data } = await client.apollo.query({
          query: GetPrescription,
          variables: { id: prescriptionId },
          // request should throw if there are any errors
          // retrieving the prescription
          errorPolicy: 'none'
        });
        if (data?.prescription) {
          const input = mapFormDataToPrescriptionInput(
            {
              ...data.prescription,
              ...prescriptionOverrides?.[prescriptionId],
              notes: constructRxNotes(
                data.prescription.notes || null,
                prescriptionOverrides?.[prescriptionId]?.notes || null,
                rxNotesPrefill
              )
            },
            prescriptionOverrides?.[prescriptionId]?.treatmentId || data.prescription.treatment.id,
            patientId
          );
          return input;
        }
        return null;
      })
    );
    rxToCreate.push(...fetchedPrescriptions.filter((rx) => !!rx));
  }

  return rxToCreate;
};

export const DraftPrescriptionsProvider = (props: DraftPrescriptionProviderProps) => {
  const { dispatchDraftPrescriptionCreated, dispatchAnalyticsTrackEvent } =
    usePrescribeEventDispatch();
  const [, recentOrdersActions] = useRecentOrders();
  const client = usePhotonClient();
  const [hasCreatedPrefillPrescriptions, setHasCreatedPrefillPrescriptions] =
    createSignal<boolean>(false);
  const [isLoadingPrefills, setIsLoadingPrefills] = createSignal<boolean>(false);
  const [draftPrescriptions, setDraftPrescriptions] = createSignal<Prescription[]>([]);

  const prescriptionIds = createMemo(() =>
    draftPrescriptions().map((prescription) => prescription.id)
  );

  const rxNotesPrefill = createMemo(() => {
    const notesPrefill = [
      props.additionalNotes || '',
      props.weight ? formatPatientWeight(props.weight, props.weightUnit) : ''
    ]
      .filter((note) => !!note)
      .join('\n\n');

    return notesPrefill || '';
  });

  // Prefill new prescriptions based on templateIds or prescriptionIds when we get a patientId
  createEffect(async () => {
    if (
      // must have templateIds or prescriptionIds to create prescriptions
      (props.templateIdsPrefill.length > 0 || props.prescriptionIdsPrefill.length > 0) &&
      // must have a patientId
      !!props.patientId &&
      // must not have created prescriptions yet
      !hasCreatedPrefillPrescriptions()
    ) {
      setHasCreatedPrefillPrescriptions(true);
      setIsLoadingPrefills(true);

      try {
        const prefillPrescriptionInputs = await transformPrefillsToPrescriptionInputs({
          client,
          patientId: props.patientId,
          templateIdsPrefill: props.templateIdsPrefill,
          templateOverrides: props.templateOverrides,
          prescriptionIdsPrefill: props.prescriptionIdsPrefill,
          prescriptionOverrides: props.prescriptionOverrides,
          rxNotesPrefill: rxNotesPrefill()
        });

        if (!prefillPrescriptionInputs.length) {
          return;
        }

        const res = await client.apollo.mutate({
          mutation: CreatePrescriptions,
          variables: { prescriptions: prefillPrescriptionInputs }
        });
        const newRxs = res.data.createPrescriptions as Prescription[];

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
        console.error('Error while trying to create prescriptions from prefills', { error });
        triggerToast({
          status: 'error',
          body: 'There was an issue creating prescriptions from prefills. Please check your configuration.'
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
        variables: mapFormDataToPrescriptionInput(
          prescriptionFormData,
          prescriptionFormData.treatment.id,
          props.patientId
        )
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
        ...mapFormDataToPrescriptionInput(prescription, prescription.treatment.id, props.patientId),
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
    rxNotesPrefill,

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
