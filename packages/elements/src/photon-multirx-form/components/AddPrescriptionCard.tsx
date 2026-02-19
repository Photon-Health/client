import {
  Button,
  Card,
  DoseCalculator,
  Icon,
  PrescriptionFormData,
  ScreeningAlerts,
  ScreeningAlertType,
  Text,
  triggerToast,
  usePrescribeEventDispatch,
  TryCreatePrescriptionTemplateOptions,
  useDraftPrescriptions
} from '@photonhealth/components';
import { DispenseUnit, Medication, Prescription } from '@photonhealth/sdk/dist/types';
import {
  any,
  intersection,
  max,
  min,
  nonempty,
  number,
  optional,
  record,
  refine,
  string
} from 'superstruct';
import * as zod from 'zod';

//Shoelace
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/button/button';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { GraphQLFormattedError } from 'graphql';
import { createEffect, createSignal, onMount, Show } from 'solid-js';
import clearForm from '../util/clearForm';
import repopulateForm from '../util/repopulateForm';
import { DisableList } from './PrescribeWorkflow';
import { afterDate, message } from '../../validators';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

const validators = {
  treatment: message(record(string(), any()), 'Please select a treatment'),
  dispenseQuantity: message(min(number(), 0, { exclusive: true }), 'Quantity must be positive'),
  dispenseUnit: message(
    refine(string(), 'nonEmptyString', (value) => value.trim().length > 0),
    'Please select a dispensing unit'
  ),
  daysSupply: message(min(number(), 0), 'Days Supply must be at least 0'),
  refillsInput: message(
    intersection([min(number(), 0), max(number(), 11)]),
    'Refills must be 0 to 11'
  ),
  instructions: message(nonempty(string()), 'Please enter instructions for the patient'),
  doNotFillBeforeDate: message(
    optional(afterDate(new Date())),
    "Please choose a date that isn't in the past"
  )
};

const supervisorSchema = zod
  .object({
    supervisorFullName: zod.string().optional(),
    supervisorNpi: zod
      .union([zod.literal(''), zod.string().regex(/^[0-9]+$/, 'Enter a valid NPI')])
      .optional()
  })
  .superRefine((data, ctx) => {
    if (!!data.supervisorFullName && !data.supervisorNpi) {
      ctx.addIssue({
        code: 'custom',
        message: 'NPI is required when Full Name is filled out',
        path: ['supervisorNpi']
      });
    }

    if (!data.supervisorFullName && !!data.supervisorNpi) {
      ctx.addIssue({
        code: 'custom',
        message: 'Full Name is required when NPI is filled out',
        path: ['supervisorFullName']
      });
    }
  });

export const AddPrescriptionCard = (props: {
  hideAddToTemplates: boolean;
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  weight?: number;
  weightUnit?: string;
  prefillNotes?: string;
  enableCombineAndDuplicate?: boolean;
  screenDraftedPrescriptions: () => void;
  draftedPrescriptionChanged: () => void;
  onDraftPrescriptionCreated: () => void;
  screeningAlerts: ScreeningAlertType[];
  catalogId?: string;
  allowOffCatalogSearch?: boolean;
  enableOrder: boolean;
  disableList?: DisableList;
}) => {
  const { tryCreatePrescription } = useDraftPrescriptions();
  const { dispatchOrderError } = usePrescribeEventDispatch();
  const [offCatalog, setOffCatalog] = createSignal<Medication | undefined>(undefined);
  const [dispenseUnit] = createSignal<DispenseUnit | undefined>(undefined);
  const [openDoseCalculator, setOpenDoseCalculator] = createSignal(false);
  const [searchText, setSearchText] = createSignal<string>('');
  const [isLoading, setIsLoading] = createSignal(false);

  const validateSupervisorFields = () => {
    const result = supervisorSchema.safeParse({
      supervisorFullName: props.store.supervisorFullName?.value,
      supervisorNpi: props.store.supervisorNpi?.value
    });
    if (result.success) {
      return {};
    }
    const errors = result.error.flatten().fieldErrors;
    const validationErrors = {
      supervisorFullName: errors.supervisorFullName?.[0],
      supervisorNpi: errors.supervisorNpi?.[0]
    };
    return { errors: validationErrors };
  };

  // superstruct doesn't have the ability to validate based on other schema fields
  // but we can use superstruct `refine` as an escape hatch to zod-based validation.
  const supervisorValidators = {
    supervisorFullName: refine(optional(string()), 'fullNameValidation', () => {
      const result = validateSupervisorFields();
      const error = result.errors?.supervisorFullName;
      return error ? error : true;
    }),
    supervisorNpi: refine(optional(string()), 'npiValidation', () => {
      const result = validateSupervisorFields();
      const error = result.errors?.supervisorNpi;
      return error ? error : true;
    })
  };

  onMount(() => {
    for (const [k, v] of Object.entries({ ...validators, ...supervisorValidators })) {
      props.actions.registerValidator({
        key: k,
        validator: v
      });
    }

    // initialize values in the prescribe form
    clearForm(props.actions, props?.prefillNotes ? { notes: props.prefillNotes } : undefined);
  });

  const handleAddPrescription = async () => {
    setIsLoading(true);

    // TODO TODO TODO move validation to the prescribe provider
    const keys = [...Object.keys(validators), ...Object.keys(supervisorValidators)];
    props.actions.validate(keys);
    const errorsPresent = props.actions.hasErrors(keys);

    if (errorsPresent) {
      setIsLoading(false);
      triggerToast({
        status: 'error',
        body: 'Some items in the form are incomplete, please check for errors'
      });
      return;
    }

    const supervisorPrefix = `Supervising Physician:`;
    const supervisorString = `${supervisorPrefix} ${props.store.supervisorFullName.value}, ${props.store.supervisorNpi.value}`;
    const notes = props.store.notes.value;
    // This may happen if user edits a draft prescription
    const notesHasSupervisor = notes.toLowerCase().includes(supervisorPrefix.toLowerCase());

    const prescriptionFormData: PrescriptionFormData = {
      doNotFillBeforeDate: props.store.doNotFillBeforeDate?.value,
      treatment: { id: props.store.treatment.value.id, name: props.store.treatment.value.name },
      dispenseAsWritten: props.store.dispenseAsWritten.value,
      dispenseQuantity: props.store.dispenseQuantity.value,
      dispenseUnit: props.store.dispenseUnit.value,
      daysSupply: props.store.daysSupply.value,
      instructions: props.store.instructions.value,
      notes: notesHasSupervisor ? notes : `${notes}\n\n${supervisorString}`.trim(),
      fillsAllowed: props.store.refillsInput.value + 1,
      // TODO: set this from template-overrides. can we stop using the props.store, with this param as a starting point?
      diagnoseCodes: []
    };

    let createdPrescription: Prescription | null = null;
    try {
      const options: TryCreatePrescriptionTemplateOptions = {
        addToTemplates: props.store.addToTemplates?.value ?? false,
        templateName: props.store.templateName?.value,
        catalogId: props.store.catalogId?.value,
        showSuccessToast: true
      };
      createdPrescription = await tryCreatePrescription(prescriptionFormData, options);
      if (createdPrescription) {
        props.onDraftPrescriptionCreated();
      }
    } catch (err) {
      dispatchOrderError([err as GraphQLFormattedError]);
    } finally {
      setIsLoading(false);
    }

    if (!createdPrescription) {
      return;
    }

    // todo: move screening up to prescribeContext (for med history Refill button clicks)
    props.screenDraftedPrescriptions();

    // RESET THE FORM
    props.actions.clearKeys([
      'treatment',
      'dispenseAsWritten',
      'dispenseQuantity',
      'dispenseUnit',
      'daysSupply',
      'refillsInput',
      'instructions',
      'notes',
      'templateName',
      'addToTemplates',
      'doNotFillBeforeDate'
      // Purposefully do not clear supervisorFullName and supervisorNpi
      // so the fields will repopulate on additional prescriptions
    ]);
    setOffCatalog(undefined);
    clearForm(props.actions, props.prefillNotes ? { notes: props.prefillNotes } : undefined);

    setSearchText('');
  };

  createEffect(() => {
    if (props.store.treatment?.value) {
      setSearchText(props.store.treatment.value.name);
    }
  });

  return (
    <Card addChildrenDivider={true}>
      <Text color="gray">Add Prescription</Text>
      <div
        class="flex flex-col"
        on:photon-medication-selected={(e: any) => {
          setOffCatalog(e.detail.medication);
          props.actions.updateFormValue({
            key: 'treatment',
            value: e.detail.medication
          });

          props.draftedPrescriptionChanged();
        }}
      >
        <photon-medication-search
          label="Search for Treatment"
          catalog-id={props.catalogId}
          allow-off-catalog-search={props.allowOffCatalogSearch}
          selected={props.store.treatment?.value ?? undefined}
          invalid={props.store.treatment?.error ?? false}
          help-text={props.store.treatment?.error}
          off-catalog-option={offCatalog()}
          search-text={searchText()}
          disable-list={props.disableList}
          on:photon-treatment-selected={(e: any) => {
            if (e.detail.data.__typename === 'PrescriptionTemplate') {
              repopulateForm(props.actions, {
                ...e.detail.data,
                notes: [e.detail.data?.notes, props.prefillNotes].filter((x) => x).join('\n\n')
              });
            } else {
              props.actions.updateFormValue({
                key: 'treatment',
                value: e.detail.data
              });
            }

            if (e.detail.catalogId) {
              props.actions.updateFormValue({
                key: 'catalogId',
                value: e.detail.catalogId
              });
            }

            props.draftedPrescriptionChanged();
          }}
          on:photon-treatment-unselected={() => {
            clearForm(
              props.actions,
              props?.prefillNotes ? { notes: props.prefillNotes } : undefined
            );

            props.draftedPrescriptionChanged();
          }}
          on:photon-search-text-changed={(e: any) => setSearchText(e.detail.text)}
        />

        <ScreeningAlerts
          /** we'll want to make sure we're only showing screening alerts that are involved with this entity */
          screeningAlerts={props.screeningAlerts.filter(
            (screeningAlert) =>
              screeningAlert.involvedEntities
                .map((involvedEntity) => involvedEntity.id)
                .indexOf(props.store.treatment?.value?.id) >= 0
          )}
          owningId={props.store.treatment?.value?.id}
        />

        <div class="flex flex-col sm:flex-none sm:grid sm:grid-cols-2 sm:gap-4">
          <div class="order-last sm:order-first">
            <photon-checkbox
              label="Dispense as written"
              tip="This prescription will be filled generically unless this box is checked"
              form-name="daw"
              class="flex-grow"
              checked={props.store.dispenseAsWritten?.value || false}
              on:photon-checkbox-toggled={(e: any) =>
                props.actions.updateFormValue({
                  key: 'dispenseAsWritten',
                  value: e.detail.checked
                })
              }
            />
          </div>
        </div>
        <div class="mt-2 sm:mt-0 sm:grid sm:grid-cols-2 sm:gap-4">
          <div class="flex items-end gap-1 items-stretch">
            <photon-number-input
              class="flex-grow flex-1 w-2/5 sm:w-auto"
              label="Quantity"
              value={props.store.dispenseQuantity?.value ?? null}
              required="true"
              min={0}
              invalid={props.store.dispenseQuantity?.error ?? false}
              help-text={props.store.dispenseQuantity?.error}
              on:photon-input-changed={(e: any) => {
                const inputValue = Number(e.detail.input);
                // this handles a bug on mobile where the input is cleared when the user types a decimal.
                // However, this introduces a bug where the input validator isn't registered. To fix this, we
                // add a undefined form update in the onMount function up top 🙄
                // https://github.com/Photon-Health/client/commit/9566daa5dea50709677c66fdceac6d2edbd43fe5
                if (!isNaN(inputValue) && e.detail.input !== '') {
                  props.actions.updateFormValue({
                    key: 'dispenseQuantity',
                    value: inputValue
                  });
                }
              }}
              style={{ width: '100px' }}
            />
            <DoseCalculator
              open={openDoseCalculator()}
              onClose={() => setOpenDoseCalculator(false)}
              medicationName={props.store.treatment?.value?.name}
              weight={props.weight}
              weightUnit={props.weightUnit}
              setAutocompleteValues={({ liquidDose, totalLiquid, unit, days }) => {
                props.actions.updateFormValue({
                  key: 'daysSupply',
                  value: Number(days)
                });
                props.actions.updateFormValue({
                  key: 'dispenseQuantity',
                  value: Number(totalLiquid)
                });
                props.actions.updateFormValue({
                  key: 'instructions',
                  value: `${liquidDose} ${unit} ${props.store.instructions?.value}`
                });
                if (unit === 'mL') {
                  props.actions.updateFormValue({
                    key: 'dispenseUnit',
                    value: 'Milliliter'
                  });
                }
              }}
            />
            <div>
              <Button
                variant="secondary"
                class="w-fit"
                onClick={() => setOpenDoseCalculator(true)}
                style={{
                  // ya, it ain't pretty, but it works. just need it for a lil bit longer
                  height: '40px',
                  'margin-top': '32px'
                }}
              >
                <Icon name="calculator" size="sm" />
              </Button>
              <div style={{ height: '23px' }} class="pt-1" />
            </div>
          </div>
          <photon-dispense-units
            label="Dispense Unit"
            required="true"
            force-label-size="true"
            selected={props.store.dispenseUnit?.value ?? dispenseUnit()?.name}
            invalid={props.store.dispenseUnit?.error ?? false}
            help-text={props.store.dispenseUnit?.error}
            on:photon-dispense-unit-selected={(e: any) => {
              props.actions.updateFormValue({
                key: 'dispenseUnit',
                value: e.detail.dispenseUnit.name
              });
            }}
          />
        </div>
        <div class="sm:grid sm:grid-cols-2 sm:gap-4">
          <photon-number-input
            class="flex-grow flex-shrink flex-1"
            label="Days Supply"
            value={props.store.daysSupply?.value ?? null}
            invalid={props.store.daysSupply?.error ?? false}
            help-text={props.store.daysSupply?.error}
            required="true"
            min={0}
            on:photon-input-changed={(e: any) => {
              props.actions.updateFormValue({
                key: 'daysSupply',
                value: Number(e.detail.input)
              });
            }}
          />
          <photon-number-input
            class="flex-grow flex-shrink flex-1"
            label="Refills"
            value={props.store.refillsInput?.value}
            required="true"
            min={0}
            max={11}
            invalid={props.store.refillsInput?.error ?? false}
            help-text={props.store.refillsInput?.error}
            on:photon-input-changed={(e: any) =>
              props.actions.updateFormValue({
                key: 'refillsInput',
                value: Number(e.detail.input)
              })
            }
          />
        </div>
        <photon-textarea
          label="Patient Instructions (SIG)"
          form-name="patient_instructions"
          required="true"
          placeholder="Enter patient instructions"
          invalid={props.store.instructions?.error ?? false}
          help-text={props.store.instructions?.error}
          on:photon-textarea-changed={(e: any) =>
            props.actions.updateFormValue({
              key: 'instructions',
              value: e.detail.value
            })
          }
          value={props.store.instructions?.value}
        />
        <photon-textarea
          label="Pharmacy Note"
          placeholder="Enter pharmacy note"
          on:photon-textarea-changed={(e: any) =>
            props.actions.updateFormValue({
              key: 'notes',
              value: e.detail.value
            })
          }
          value={props.store.notes?.value}
        />
        <Text size="sm" color="black" class="pb-[21px]">
          Some pharmacies require supervising physician information for this prescription. Adding it
          here can help avoid callbacks and delays.
        </Text>
        <photon-text-input
          label="Supervising Physician Full Name"
          value={props.store.supervisorFullName?.value ?? ''}
          invalid={props.store.supervisorFullName?.error ?? false}
          help-text={props.store.supervisorFullName?.error}
          on:photon-input-changed={(e: any) =>
            props.actions.updateFormValue({
              key: 'supervisorFullName',
              value: e.detail.input
            })
          }
        />
        <photon-text-input
          label="Supervising Physician NPI"
          value={props.store.supervisorNpi?.value ?? ''}
          invalid={props.store.supervisorNpi?.error ?? false}
          help-text={props.store.supervisorNpi?.error}
          on:photon-input-changed={(e: any) =>
            props.actions.updateFormValue({
              key: 'supervisorNpi',
              value: e.detail.input
            })
          }
        />
        <div class="w-full">
          <photon-datepicker
            value={props.store.doNotFillBeforeDate?.value}
            label="Do Not Fill Before"
            invalid={props.store.doNotFillBeforeDate?.error ?? false}
            help-text={props.store.doNotFillBeforeDate?.error}
            min={new Date()}
            on:photon-datepicker-selected={(e: any) =>
              props.actions.updateFormValue({
                key: 'doNotFillBeforeDate',
                value: e.detail.date
              })
            }
          />
        </div>
        <div class="flex flex-col xs:flex-row gap-2">
          <Show when={!props.hideAddToTemplates}>
            <photon-checkbox
              label="Add To Personal Templates"
              form-name="addToTemplates"
              checked={props.store.addToTemplates?.value || false}
              on:photon-checkbox-toggled={(e: any) => {
                props.actions.updateFormValue({
                  key: 'addToTemplates',
                  value: e.detail.checked
                });
              }}
            />
          </Show>
          <Show when={props.store.addToTemplates?.value ?? false}>
            <photon-text-input
              class="flex-grow flex-shrink flex-1"
              label="Template Name"
              value={props.store.templateName?.value ?? ''}
              invalid={props.store.templateName?.error ?? false}
              help-text={props.store.templateName?.error}
              on:photon-input-changed={(e: any) =>
                props.actions.updateFormValue({
                  key: 'templateName',
                  value: e.detail.input
                })
              }
            />
          </Show>
          <div class="flex flex-grow justify-end">
            <Button
              class="w-full xs:!w-auto h-fit"
              size="lg"
              onClick={() => {
                if (!isLoading()) {
                  handleAddPrescription();
                }
              }}
              loading={isLoading()}
              variant="primary"
              color="blue"
            >
              Add to drafts
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
