import {
  Button,
  CALENDAR_DATE_FORMAT,
  Card,
  Checkbox,
  DispenseUnitSelect,
  DoseCalculator,
  Icon,
  Input,
  InputGroup,
  PrescriptionFormData,
  ScreeningAlerts,
  ScreeningAlertType,
  Text,
  Textarea,
  triggerToast,
  TryCreatePrescriptionTemplateOptions,
  useDraftPrescriptions,
  usePhoton,
  usePrescribeEventDispatch
} from '@photonhealth/components';
import { Address, Medication, Name, Prescription } from '@photonhealth/sdk/dist/types';
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
import { format } from 'date-fns';
import { GraphQLFormattedError } from 'graphql';
import { createEffect, createSignal, onMount, Show } from 'solid-js';
import clearForm from '../util/clearForm';
import repopulateForm from '../util/repopulateForm';
import { DisableList } from './PrescribeWorkflow';
import { afterDate, message } from '../../validators';
import gql from 'graphql-tag';

const validators = {
  treatment: message(record(string(), any()), 'Please select a treatment'),
  dispenseQuantity: message(min(number(), 0, { exclusive: true }), 'Quantity must be positive'),
  dispenseUnit: message(
    refine(string(), 'nonEmptyString', (value) => value.trim().length > 0),
    'Please select a dispensing unit'
  ),
  daysSupply: message(min(number(), 0), 'Days Supply must be at least 0'),
  refills: message(intersection([min(number(), 0), max(number(), 11)]), 'Refills must be 0 to 11'),
  instructions: message(nonempty(string()), 'Please enter instructions for the patient'),
  doNotFillBeforeDate: message(
    optional(afterDate(new Date())),
    "Please choose a date that isn't in the past"
  )
};

// superstruct doesn't support validation based on sibling fields
// and we also want to move away from superstruct generally.
// Temporary escape hatch to zod validation while photon-prescribe-workflow
// still uses superstruct
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

const MeUserQuery = gql`
  query MeUserQuery {
    me {
      name {
        title
      }
      address {
        state
      }
    }
  }
`;

type MeUserQueryType = {
  me: {
    name: Pick<Name, 'title'>;
    address: Pick<Address, 'state'>;
  };
};

const calculateNeedsSupervisor = ({
  title,
  state
}: {
  title: Name['title'];
  state: Address['state'];
}) =>
  !!title &&
  ['NP', 'PA'].includes(title) &&
  ['CA', 'FL', 'GA', 'MI', 'MO', 'NC', 'OK', 'SC', 'TN', 'TX', 'VA'].includes(state.toUpperCase());

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
  const { dispatchOrderError, dispatchAnalytics } = usePrescribeEventDispatch();
  const client = usePhoton();
  const [offCatalog, setOffCatalog] = createSignal<Medication | undefined>(undefined);
  const [openDoseCalculator, setOpenDoseCalculator] = createSignal(false);
  const [searchText, setSearchText] = createSignal<string>('');
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [needsSupervisor, setNeedsSupervisor] = createSignal<boolean>(false);

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

  onMount(async () => {
    for (const [k, v] of Object.entries({ ...validators, ...supervisorValidators })) {
      props.actions.registerValidator({
        key: k,
        validator: v
      });
    }

    // initialize values in the prescribe form
    clearForm(props.actions, props?.prefillNotes ? { notes: props.prefillNotes } : undefined);

    const {
      data: { me }
    } = await client.sdk.apolloClinical.query<MeUserQueryType>({
      query: MeUserQuery
    });
    const needsSupervisor = calculateNeedsSupervisor({
      title: me.name.title,
      state: me.address.state
    });
    setNeedsSupervisor(needsSupervisor);
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

    const notes = props.store.notes.value;
    const supervisorPrefix = `Supervising Physician:`;
    // Notes may already contain supervisor
    // if user edits a draft prescription
    const notesNeedsSupervisor =
      needsSupervisor() && !notes.toLowerCase().includes(supervisorPrefix.toLowerCase());
    const supervisorString = `${supervisorPrefix} ${props.store.supervisorFullName.value}, ${props.store.supervisorNpi.value}`;

    const prescriptionFormData: PrescriptionFormData = {
      doNotFillBeforeDate: props.store.doNotFillBeforeDate?.value,
      treatment: { id: props.store.treatment.value.id, name: props.store.treatment.value.name },
      dispenseAsWritten: props.store.dispenseAsWritten.value,
      dispenseQuantity: props.store.dispenseQuantity.value,
      dispenseUnit: props.store.dispenseUnit.value,
      daysSupply: props.store.daysSupply.value,
      instructions: props.store.instructions.value,
      notes: notesNeedsSupervisor ? `${notes.trim()}\n\n${supervisorString}` : notes,
      fillsAllowed: props.store.refills.value + 1,
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
      'refills',
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
      <div class="flex flex-col gap-1">
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
            dispatchAnalytics({
              trackEventType: 'prescription_field_interaction',
              properties: { fieldName: 'treatment', hasValue: true }
            });

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

        <div class="mt-2">
          <Checkbox
            mainText="Dispense as written"
            tooltip="This prescription will be filled generically unless this box is checked"
            showOptionalSubtext
            checked={props.store.dispenseAsWritten?.value || false}
            onChange={(checked: boolean) => {
              props.actions.updateFormValue({
                key: 'dispenseAsWritten',
                value: checked
              });
              dispatchAnalytics({
                trackEventType: 'prescription_field_interaction',
                properties: { fieldName: 'dispenseAsWritten', hasValue: checked }
              });
            }}
          />
        </div>
        <div class="sm:grid sm:grid-cols-2 sm:gap-4 mt-2">
          <div class="flex items-start gap-1">
            <div class="flex-1" style={{ width: '100px' }}>
              <InputGroup label="Quantity" required error={props.store.dispenseQuantity?.error}>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={props.store.dispenseQuantity?.value ?? undefined}
                  min={0}
                  onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                    props.actions.updateFormValue({
                      key: 'dispenseQuantity',
                      value: Number(e.currentTarget.value)
                    });
                  }}
                  onBlur={(e) => {
                    dispatchAnalytics({
                      trackEventType: 'prescription_field_interaction',
                      properties: {
                        fieldName: 'dispenseQuantity',
                        hasValue: Boolean(e.currentTarget.value)
                      }
                    });
                  }}
                />
              </InputGroup>
            </div>
            {/* Wrap in InputGroup with invisible label to match Quantity's vertical layout */}
            <InputGroup label={'\u00A0'}>
              <Button
                variant="secondary"
                class="w-11 h-11 sm:h-12"
                onClick={() => setOpenDoseCalculator(true)}
              >
                <Icon name="calculator" size="sm" />
              </Button>
            </InputGroup>
          </div>
          <InputGroup label="Dispense Unit" required error={props.store.dispenseUnit?.error}>
            <DispenseUnitSelect
              value={props.store.dispenseUnit?.value ?? undefined}
              onChange={(e: Event & { currentTarget: HTMLSelectElement }) => {
                props.actions.updateFormValue({
                  key: 'dispenseUnit',
                  value: e.currentTarget.value
                });
              }}
              onBlur={(e) => {
                dispatchAnalytics({
                  trackEventType: 'prescription_field_interaction',
                  properties: {
                    fieldName: 'dispenseUnit',
                    hasValue: Boolean(e.currentTarget.value)
                  }
                });
              }}
            />
          </InputGroup>
        </div>
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
        <div class="sm:grid sm:grid-cols-2 sm:gap-4">
          <InputGroup label="Days Supply" required error={props.store.daysSupply?.error}>
            <Input
              type="number"
              inputMode="numeric"
              value={props.store.daysSupply?.value ?? undefined}
              min={0}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                props.actions.updateFormValue({
                  key: 'daysSupply',
                  value: Number(e.currentTarget.value)
                });
              }}
              onBlur={(e) => {
                dispatchAnalytics({
                  trackEventType: 'prescription_field_interaction',
                  properties: {
                    fieldName: 'daysSupply',
                    hasValue: Boolean(e.currentTarget.value)
                  }
                });
              }}
            />
          </InputGroup>
          <InputGroup label="Refills" required error={props.store.refills?.error}>
            <Input
              type="number"
              inputMode="numeric"
              value={props.store.refills?.value ?? undefined}
              min={0}
              max={11}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                props.actions.updateFormValue({
                  key: 'refills',
                  value: Number(e.currentTarget.value)
                });
              }}
              onBlur={(e) => {
                dispatchAnalytics({
                  trackEventType: 'prescription_field_interaction',
                  properties: {
                    fieldName: 'refills',
                    hasValue: Boolean(e.currentTarget.value)
                  }
                });
              }}
            />
          </InputGroup>
        </div>
        <InputGroup
          label="Patient Instructions (SIG)"
          required
          error={props.store.instructions?.error}
        >
          <Textarea
            placeholder="Enter patient instructions"
            value={props.store.instructions?.value}
            onInput={(value: string) => {
              props.actions.updateFormValue({
                key: 'instructions',
                value
              });
            }}
            onBlur={(value: string) => {
              dispatchAnalytics({
                trackEventType: 'prescription_field_interaction',
                properties: { fieldName: 'instructions', hasValue: Boolean(value) }
              });
            }}
          />
        </InputGroup>
        <InputGroup label="Pharmacy Note" showOptionalSubtext>
          <Textarea
            placeholder="Enter pharmacy note"
            value={props.store.notes?.value}
            onInput={(value: string) => {
              props.actions.updateFormValue({
                key: 'notes',
                value
              });
            }}
            onBlur={(value: string) => {
              dispatchAnalytics({
                trackEventType: 'prescription_field_interaction',
                properties: { fieldName: 'pharmacy_notes', hasValue: Boolean(value) }
              });
            }}
          />
        </InputGroup>
        <InputGroup
          label="Do Not Fill Before"
          showOptionalSubtext
          error={props.store.doNotFillBeforeDate?.error}
        >
          <Input
            type="date"
            value={props.store.doNotFillBeforeDate?.value}
            min={format(new Date(), CALENDAR_DATE_FORMAT)}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              props.actions.updateFormValue({
                key: 'doNotFillBeforeDate',
                value: e.currentTarget.value || undefined
              });
            }}
            onBlur={(e) => {
              dispatchAnalytics({
                trackEventType: 'prescription_field_interaction',
                properties: {
                  fieldName: 'doNotFillBeforeDate',
                  hasValue: Boolean(e.currentTarget.value)
                }
              });
            }}
          />
        </InputGroup>
        <div class="flex flex-col xs:flex-row mt-4">
          <Show when={!props.hideAddToTemplates}>
            <Checkbox
              mainText="Add To Personal Templates"
              showOptionalSubtext
              checked={props.store.addToTemplates?.value || false}
              onChange={(checked: boolean) => {
                props.actions.updateFormValue({
                  key: 'addToTemplates',
                  value: checked
                });
                dispatchAnalytics({
                  trackEventType: 'prescription_field_interaction',
                  properties: { fieldName: 'addToTemplates', hasValue: checked }
                });
              }}
            />
          </Show>
          <Show when={props.store.addToTemplates?.value ?? false}>
            <div class="flex-1 mt-2">
              <InputGroup label="Template Name" error={props.store.templateName?.error}>
                <Input
                  value={props.store.templateName?.value ?? ''}
                  onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                    props.actions.updateFormValue({
                      key: 'templateName',
                      value: e.currentTarget.value
                    })
                  }
                />
              </InputGroup>
            </div>
          </Show>
          <div class="flex flex-grow justify-end">
            <Button
              class="w-full xs:!w-auto h-fit mt-6"
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
