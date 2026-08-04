import { Accessor, createEffect, createSignal, Setter } from 'solid-js';
import { DraftPrescriptionSource, PhotonClient } from '@photonhealth/sdk';
import { MutationCreatePrescriptionsArgs, Prescription } from '@photonhealth/sdk/dist/types';
import { buildPrescriptionSnapshot } from '../../../analytics/buildFieldSnapshot';
import { usePrescribeEventDispatch } from '../../PrescribeEventDispatchProvider';
import { usePhotonClient } from '../../SDKProvider';
import { CreatePrescriptions, GetPrescription } from '../../../fetch';
import triggerToast from '../../../utils/toastTriggers';
import { Prefill } from '../../../utils/Prefill';
import { constructRxNotes } from './formatters';
import { mapFormDataToPrescriptionInput } from './mappers';
import {
  InitialPrescriptionInput,
  initialPrescriptionInputSchema
} from './initialPrescriptionInputSchema';

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

export type TemplateOverridesPrefill = Prefill<TemplateOverrides>;

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
    // ISO string or date string in format ex. 2026-10-02
    doNotFillBeforeDate?: string;
  };
};

export type PrescriptionOverridesPrefill = Prefill<PrescriptionOverrides>;

export type InitialPrescriptionsPrefill = Prefill<InitialPrescriptionInput[]>;

export type PrefillPrescriptionsProps = {
  patientId: string;
  templateIds: string[];
  templateOverrides: TemplateOverridesPrefill;
  prescriptionIds: string[];
  prescriptionOverrides: PrescriptionOverridesPrefill;
  initialPrescriptions?: InitialPrescriptionsPrefill;
};

export type PrefillPrescriptionsOptions = {
  rxNotesPrefill: Accessor<string>;
  setDraftPrescriptions: Setter<Prescription[]>;
};

type PrescriptionInputs = MutationCreatePrescriptionsArgs['prescriptions'];

/**
 * Creates draft prescriptions from the prefill props (template IDs, prescription IDs and
 * initial prescriptions) once a patientId is available. Runs at most once per mount.
 */
export const usePrefillPrescriptions = (
  props: PrefillPrescriptionsProps,
  options: PrefillPrescriptionsOptions
) => {
  const { dispatchDraftPrescriptionCreated, dispatchAnalyticsTrackEvent } =
    usePrescribeEventDispatch();
  const client = usePhotonClient();
  const [hasCreatedPrefillPrescriptions, setHasCreatedPrefillPrescriptions] =
    createSignal<boolean>(false);
  const [isLoadingPrefills, setIsLoadingPrefills] = createSignal<boolean>(false);

  const trackCreatedDrafts = (prescriptions: Prescription[], source: DraftPrescriptionSource) => {
    prescriptions.forEach((rx) => {
      dispatchDraftPrescriptionCreated(rx);
      dispatchAnalyticsTrackEvent('ctaClicked', {
        name: 'Draft Prescription Added',
        draftPrescriptionSource: source,
        fields: buildPrescriptionSnapshot(rx)
      });
    });
  };

  createEffect(async () => {
    // Only attempt to create once
    if (hasCreatedPrefillPrescriptions()) {
      return;
    }
    // Patient needs to be selected before creating prefills
    if (!props.patientId) {
      return;
    }

    const hasPrefills =
      props.templateIds.length > 0 ||
      props.prescriptionIds.length > 0 ||
      props.initialPrescriptions;

    if (!hasPrefills) {
      return;
    }

    setHasCreatedPrefillPrescriptions(true);
    setIsLoadingPrefills(true);

    try {
      const rxNotesPrefill = options.rxNotesPrefill();
      const rxPromises: Array<() => Promise<Prescription[]>> = [];

      if (props.templateIds.length > 0) {
        const rxToCreate = createPrefillsFromTemplateIds({
          templateIds: props.templateIds,
          templateOverrides: props.templateOverrides,
          patientId: props.patientId,
          rxNotesPrefill
        });

        rxPromises.push(async () => {
          const res = await client.apollo.mutate({
            mutation: CreatePrescriptions,
            variables: { prescriptions: rxToCreate }
          });
          const prescriptions = res.data.createPrescriptions as Prescription[] | null;
          if (prescriptions) {
            trackCreatedDrafts(prescriptions, 'template_prefill');
          }
          return prescriptions || [];
        });
      }

      if (props.prescriptionIds.length > 0) {
        const rxToCreate = await createPrefillsFromPrescriptionIds(client, {
          prescriptionIds: props.prescriptionIds,
          prescriptionOverrides: props.prescriptionOverrides,
          patientId: props.patientId,
          rxNotesPrefill
        });

        rxPromises.push(async () => {
          const res = await client.apollo.mutate({
            mutation: CreatePrescriptions,
            variables: { prescriptions: rxToCreate }
          });
          const prescriptions = res.data.createPrescriptions as Prescription[] | null;
          if (prescriptions) {
            trackCreatedDrafts(prescriptions, 'prescription_id_prefill');
          }
          return prescriptions || [];
        });
      }

      if (props.initialPrescriptions) {
        const rxToCreate = createPrefillsFromInitialPrescriptions({
          initialPrescriptions: props.initialPrescriptions,
          patientId: props.patientId
        });

        rxPromises.push(async () => {
          const res = await client.apollo.mutate({
            mutation: CreatePrescriptions,
            variables: { prescriptions: rxToCreate }
          });
          const prescriptions = res.data.createPrescriptions as Prescription[] | null;
          if (prescriptions) {
            trackCreatedDrafts(prescriptions, 'initial_prescriptions_prefill');
          }
          return prescriptions || [];
        });
      }

      const newRxs = await Promise.all(rxPromises.map((promise) => promise())).then((res) =>
        res.flat()
      );

      if (newRxs.length) {
        options.setDraftPrescriptions((prev) => [...prev, ...newRxs]);
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
  });

  return { isLoadingPrefills };
};

const createPrefillsFromTemplateIds = ({
  templateIds,
  templateOverrides,
  patientId,
  rxNotesPrefill
}: {
  templateIds: string[];
  templateOverrides: TemplateOverridesPrefill;
  patientId: string;
  rxNotesPrefill: string;
}): PrescriptionInputs => {
  const dedupedTemplateIds = Array.from(new Set(templateIds));
  const overrides =
    templateOverrides && typeof templateOverrides !== 'string' ? templateOverrides : {};

  return dedupedTemplateIds.map((templateId) => ({
    ...overrides[templateId],
    patientId,
    templateId,
    notes: constructRxNotes(null, overrides[templateId]?.notes || null, rxNotesPrefill)
  }));
};

const createPrefillsFromPrescriptionIds = async (
  client: PhotonClient,
  {
    prescriptionIds,
    prescriptionOverrides,
    patientId,
    rxNotesPrefill
  }: {
    prescriptionIds: string[];
    prescriptionOverrides: PrescriptionOverridesPrefill;
    patientId: string;
    rxNotesPrefill: string;
  }
): Promise<PrescriptionInputs> => {
  const overrides =
    prescriptionOverrides && typeof prescriptionOverrides !== 'string' ? prescriptionOverrides : {};

  return Promise.all(
    prescriptionIds.map(async (prescriptionId: string) => {
      const { data } = await client.apollo.query({
        query: GetPrescription,
        variables: { id: prescriptionId },
        // request should throw if there are any errors
        // retrieving the prescription
        errorPolicy: 'none'
      });
      if (!data?.prescription) {
        return null;
      }
      const input = mapFormDataToPrescriptionInput(
        {
          ...data.prescription,
          ...overrides[prescriptionId],
          notes: constructRxNotes(
            data.prescription.notes || null,
            overrides[prescriptionId]?.notes || null,
            rxNotesPrefill
          ),
          doNotFillBeforeDate: overrides[prescriptionId]?.doNotFillBeforeDate
            ? overrides[prescriptionId]?.doNotFillBeforeDate.slice(0, 10)
            : undefined
        },
        overrides[prescriptionId]?.treatmentId || data.prescription.treatment.id,
        patientId
      );
      return input;
    })
  );
};

const createPrefillsFromInitialPrescriptions = ({
  initialPrescriptions,
  patientId
}: {
  initialPrescriptions: InitialPrescriptionsPrefill;
  patientId: string;
}): PrescriptionInputs => {
  if (typeof initialPrescriptions === 'string') {
    throw new Error('Invalid JSON passed to initialPrescriptions');
  }

  return initialPrescriptions.map((draft) => {
    const result = initialPrescriptionInputSchema.safeParse(draft);

    if (result.error) {
      throw new Error(result.error.issues.map((i) => i.message).join(', '));
    }

    return { ...result.data, patientId };
  });
};
