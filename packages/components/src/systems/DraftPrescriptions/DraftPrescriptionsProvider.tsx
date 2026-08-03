import {
  Accessor,
  createContext,
  createMemo,
  createSignal,
  JSXElement,
  Setter,
  useContext
} from 'solid-js';
import { Prescription, PrescriptionState } from '@photonhealth/sdk/dist/types';
import { DraftPrescriptionSource } from '@photonhealth/sdk';
import { buildPrescriptionSnapshot } from '../../analytics/buildFieldSnapshot';
import { usePrescribeEventDispatch } from '../PrescribeEventDispatchProvider';
import { useRecentOrders } from '../RecentOrders';
import { usePhotonClient } from '../SDKProvider';
import {
  CreatePrescription,
  CreatePrescriptionTemplate,
  UpdatePrescriptionStates
} from '../../fetch';
import triggerToast from '../../utils/toastTriggers';
import { formatPatientWeight } from './utils/formatters';
import { mapFormDataToPrescriptionInput } from './utils/mappers';
import {
  type InitialPrescriptionsPrefill,
  type PrescriptionOverrides,
  type TemplateOverrides,
  usePrefillPrescriptions
} from './utils/usePrefillPrescriptions';

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
  templateIds: string[];
  templateOverrides: TemplateOverrides;
  prescriptionIds: string[];
  prescriptionOverrides: PrescriptionOverrides;
  initialPrescriptions?: InitialPrescriptionsPrefill;
  enableCombineAndDuplicate: boolean;
  additionalNotes?: string;
  weight?: number;
  weightUnit?: string;
}

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

export const DraftPrescriptionsProvider = (props: DraftPrescriptionProviderProps) => {
  const { dispatchDraftPrescriptionCreated, dispatchAnalyticsTrackEvent } =
    usePrescribeEventDispatch();
  const [, recentOrdersActions] = useRecentOrders();
  const client = usePhotonClient();
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

  const { isLoadingPrefills } = usePrefillPrescriptions(props, {
    rxNotesPrefill,
    setDraftPrescriptions
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
