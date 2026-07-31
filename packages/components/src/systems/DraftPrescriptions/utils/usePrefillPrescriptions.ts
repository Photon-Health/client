import { Accessor, createEffect, createSignal, Setter } from 'solid-js';
import { MutationCreatePrescriptionsArgs, Prescription } from '@photonhealth/sdk/dist/types';
import { PhotonClient } from '@photonhealth/sdk';
import { buildPrescriptionSnapshot } from '../../../analytics/buildFieldSnapshot';
import { usePrescribeEventDispatch } from '../../PrescribeEventDispatchProvider';
import { usePhotonClient } from '../../SDKProvider';
import { CreatePrescriptions, GetPrescription } from '../../../fetch';
import triggerToast from '../../../utils/toastTriggers';
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

// At runtime `solid-element`'s customElement parses the `supervisor` HTML
// attribute as JSON. Valid JSON → object; invalid JSON → the raw string.
export type InitialPrescriptionsPrefill = Partial<InitialPrescriptionInput>[] | string;

export type PrefillPrescriptionsProps = {
  patientId: string;
  templateIdsPrefill: string[];
  templateOverrides: TemplateOverrides;
  prescriptionIdsPrefill: string[];
  prescriptionOverrides: PrescriptionOverrides;
  initialPrescriptions?: InitialPrescriptionsPrefill;
};

export type PrefillPrescriptionsOptions = {
  rxNotesPrefill: Accessor<string>;
  setDraftPrescriptions: Setter<Prescription[]>;
};

type PrescriptionInputs = MutationCreatePrescriptionsArgs['prescriptions'];

// Create prescriptions from template IDs with possible overrides
const buildInputsFromTemplateIds = ({
  patientId,
  templateIdsPrefill,
  templateOverrides,
  rxNotesPrefill
}: {
  patientId: string;
  templateIdsPrefill: string[];
  templateOverrides: TemplateOverrides;
  rxNotesPrefill: string;
}): PrescriptionInputs => {
  const dedupedTemplateIds = Array.from(new Set(templateIdsPrefill));

  return dedupedTemplateIds.map((templateId) => ({
    ...templateOverrides?.[templateId],
    patientId,
    templateId,
    notes: constructRxNotes(null, templateOverrides?.[templateId]?.notes || null, rxNotesPrefill)
  }));
};

// Create prescriptions from prescription IDs with possible overrides
const buildInputsFromPrescriptionIds = async ({
  client,
  patientId,
  prescriptionIdsPrefill,
  prescriptionOverrides,
  rxNotesPrefill
}: {
  client: PhotonClient;
  patientId: string;
  prescriptionIdsPrefill: string[];
  prescriptionOverrides: PrescriptionOverrides;
  rxNotesPrefill: string;
}): Promise<PrescriptionInputs> => {
  const fetchedPrescriptions = await Promise.all(
    prescriptionIdsPrefill.map(async (prescriptionId: string) => {
      const overrides = prescriptionOverrides?.[prescriptionId] || {};
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
            ...overrides,
            notes: constructRxNotes(
              data.prescription.notes || null,
              overrides.notes || null,
              rxNotesPrefill
            ),
            doNotFillBeforeDate: overrides.doNotFillBeforeDate
              ? overrides.doNotFillBeforeDate.slice(0, 10)
              : undefined
          },
          overrides.treatmentId || data.prescription.treatment.id,
          patientId
        );
        return input;
      }
      return null;
    })
  );

  return fetchedPrescriptions.filter((rx) => !!rx);
};

// Create prescriptions from the initialPrescriptions JSON array
const buildInputsFromInitialPrescriptions = ({
  patientId,
  initialPrescriptions
}: {
  patientId: string;
  initialPrescriptions: InitialPrescriptionsPrefill;
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

const transformPrefillsToPrescriptionInputs = async ({
  client,
  patientId,
  templateIdsPrefill,
  templateOverrides,
  prescriptionIdsPrefill,
  prescriptionOverrides,
  initialPrescriptions,
  rxNotesPrefill
}: {
  client: PhotonClient;
  patientId: string;
  templateIdsPrefill: string[];
  templateOverrides: TemplateOverrides;
  prescriptionIdsPrefill: string[];
  prescriptionOverrides: PrescriptionOverrides;
  initialPrescriptions?: InitialPrescriptionsPrefill;
  rxNotesPrefill: string;
}): Promise<PrescriptionInputs> => {
  const rxToCreate: PrescriptionInputs = [];

  if (templateIdsPrefill.length > 0) {
    rxToCreate.push(
      ...buildInputsFromTemplateIds({
        patientId,
        templateIdsPrefill,
        templateOverrides,
        rxNotesPrefill
      })
    );
  }

  if (prescriptionIdsPrefill.length > 0) {
    rxToCreate.push(
      ...(await buildInputsFromPrescriptionIds({
        client,
        patientId,
        prescriptionIdsPrefill,
        prescriptionOverrides,
        rxNotesPrefill
      }))
    );
  }

  if (initialPrescriptions) {
    rxToCreate.push(...buildInputsFromInitialPrescriptions({ patientId, initialPrescriptions }));
  }

  return rxToCreate;
};

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

  createEffect(async () => {
    const hasPrefills =
      props.templateIdsPrefill.length > 0 ||
      props.prescriptionIdsPrefill.length > 0 ||
      props.initialPrescriptions;

    if (hasPrefills && !!props.patientId && !hasCreatedPrefillPrescriptions()) {
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
          initialPrescriptions: props.initialPrescriptions,
          rxNotesPrefill: options.rxNotesPrefill()
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
          options.setDraftPrescriptions((prev) => [...prev, ...newRxs]);
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

  return { isLoadingPrefills };
};
