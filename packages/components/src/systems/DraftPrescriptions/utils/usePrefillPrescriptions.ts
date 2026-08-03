import { Accessor, createEffect, createSignal, Setter } from 'solid-js';
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

  createEffect(async () => {
    const hasPrefills =
      props.templateIds.length > 0 ||
      props.prescriptionIds.length > 0 ||
      props.initialPrescriptions;

    if (hasPrefills && !!props.patientId && !hasCreatedPrefillPrescriptions()) {
      setHasCreatedPrefillPrescriptions(true);
      setIsLoadingPrefills(true);

      try {
        const rxNotesPrefill = options.rxNotesPrefill();
        const newRxs: Prescription[] = [];

        const rxPromises = [
          // Create prescriptions from template IDs with possible overrides
          async () => {
            if (props.templateIds.length > 0) {
              const dedupedTemplateIds = Array.from(new Set(props.templateIds));
              const overrides =
                props.templateOverrides && typeof props.templateOverrides !== 'string'
                  ? props.templateOverrides
                  : {};

              const rxToCreate: PrescriptionInputs = dedupedTemplateIds.map((templateId) => ({
                ...overrides[templateId],
                patientId: props.patientId,
                templateId,
                notes: constructRxNotes(null, overrides[templateId]?.notes || null, rxNotesPrefill)
              }));

              const res = await client.apollo.mutate({
                mutation: CreatePrescriptions,
                variables: { prescriptions: rxToCreate }
              });
              const prescriptions = res.data.createPrescriptions as Prescription[] | null;
              if (prescriptions) {
                prescriptions.forEach((rx) => {
                  dispatchDraftPrescriptionCreated(rx);
                  dispatchAnalyticsTrackEvent('ctaClicked', {
                    name: 'Draft Prescription Added',
                    draftPrescriptionSource: 'template_prefill',
                    fields: buildPrescriptionSnapshot(rx)
                  });
                });
                newRxs.push(...prescriptions);
              }
            }
          },
          // Create prescriptions from prescription IDs with possible overrides
          async () => {
            if (props.prescriptionIds.length > 0) {
              const rxToCreate: PrescriptionInputs = await Promise.all(
                props.prescriptionIds.map(async (prescriptionId: string) => {
                  const overrides =
                    props.prescriptionOverrides && typeof props.prescriptionOverrides !== 'string'
                      ? props.prescriptionOverrides
                      : {};
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
                      props.patientId
                    );
                    return input;
                  }
                  return null;
                })
              );

              const res = await client.apollo.mutate({
                mutation: CreatePrescriptions,
                variables: { prescriptions: rxToCreate }
              });
              const prescriptions = res.data.createPrescriptions as Prescription[] | null;
              if (prescriptions) {
                prescriptions.forEach((rx) => {
                  dispatchDraftPrescriptionCreated(rx);
                  dispatchAnalyticsTrackEvent('ctaClicked', {
                    name: 'Draft Prescription Added',
                    draftPrescriptionSource: 'prescription_id_prefill',
                    fields: buildPrescriptionSnapshot(rx)
                  });
                });
                newRxs.push(...prescriptions);
              }
            }
          },
          // Create prescriptions from the initialPrescriptions JSON array
          async () => {
            if (props.initialPrescriptions) {
              if (typeof props.initialPrescriptions === 'string') {
                throw new Error('Invalid JSON passed to initialPrescriptions');
              }

              const rxToCreate: PrescriptionInputs = props.initialPrescriptions.map((draft) => {
                const result = initialPrescriptionInputSchema.safeParse(draft);

                if (result.error) {
                  throw new Error(result.error.issues.map((i) => i.message).join(', '));
                }

                return { ...result.data, patientId: props.patientId };
              });

              const res = await client.apollo.mutate({
                mutation: CreatePrescriptions,
                variables: { prescriptions: rxToCreate }
              });
              const prescriptions = res.data.createPrescriptions as Prescription[] | null;
              if (prescriptions) {
                prescriptions.forEach((rx) => {
                  dispatchDraftPrescriptionCreated(rx);
                  dispatchAnalyticsTrackEvent('ctaClicked', {
                    name: 'Draft Prescription Added',
                    draftPrescriptionSource: 'initial_prescriptions_prefill',
                    fields: buildPrescriptionSnapshot(rx)
                  });
                });
                newRxs.push(...prescriptions);
              }
            }
          }
        ];

        await Promise.all(rxPromises.map((promise) => promise()));

        if (newRxs) {
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
    }
  });

  return { isLoadingPrefills };
};
