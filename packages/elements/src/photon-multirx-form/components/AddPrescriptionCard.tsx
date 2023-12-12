import { afterDate, message } from '../../validators';
import { record, string, any, number, min, size } from 'superstruct';
import { format } from 'date-fns';
import { Card, Text, Button, Icon } from '@photonhealth/components';
import { DispenseUnit, Medication } from '@photonhealth/sdk/dist/types';
import { DoseCalculator, triggerToast } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';

//Shoelace
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/button/button';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { createSignal, Show, onMount } from 'solid-js';
import repopulateForm from '../util/repopulateForm';
import clearForm from '../util/clearForm';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

const validators = {
  treatment: message(record(string(), any()), 'Please select a treatment...'),
  dispenseQuantity: message(min(number(), 1), 'Quantity must be positive'),
  daysSupply: message(min(number(), 0), 'Days Supply must be at least 0'),
  refillsInput: message(min(number(), 0), 'Refills must be at least 0'),
  instructions: message(
    size(string(), 1, Infinity),
    'Please enter instructions for the patient...'
  ),
  effectiveDate: message(afterDate(new Date()), "Please choose a date that isn't in the past")
};

const patientWeight = (weight: number, weightUnit = 'lb') =>
  `Patient weight: ${weight} ${weightUnit}`;

export const AddPrescriptionCard = (props: {
  hideAddToTemplates: boolean;
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  weight?: number;
  weightUnit?: string;
}) => {
  const [medDialogOpen, setMedDialogOpen] = createSignal(false);
  const [offCatalog, setOffCatalog] = createSignal<Medication | undefined>(undefined);
  const [dispenseUnit] = createSignal<DispenseUnit | undefined>(undefined);
  const [openDoseCalculator, setOpenDoseCalculator] = createSignal(false);

  let ref: any;

  onMount(() => {
    for (const [k, v] of Object.entries(validators)) {
      props.actions.registerValidator({
        key: k,
        validator: v
      });
    }

    // This is a hack to fix a bug where the form is cleared when the user types a decimal
    // in the dispense quantity input. But because of the hack, we have to do this to register the validator
    // that would otherwise be registered with the input below 🙃
    props.actions.updateFormValue({
      key: 'dispenseQuantity',
      value: undefined
    });

    if (props.weight) {
      props.actions.updateFormValue({
        key: 'notes',
        value: patientWeight(props.weight, props.weightUnit)
      });
    }
  });

  const handleAddPrescription = () => {
    const keys = [
      'treatment',
      'effectiveDate',
      'dispenseQuantity',
      'daysSupply',
      'refillsInput',
      'instructions'
    ];
    props.actions.validate(keys);
    const errorsPresent = props.actions.hasErrors(keys);
    if (!errorsPresent) {
      props.actions.updateFormValue({
        key: 'draftPrescriptions',
        value: [
          ...(props.store.draftPrescriptions?.value || []),
          {
            id: String(Math.random()),
            effectiveDate: props.store.effectiveDate.value,
            treatment: props.store.treatment.value,
            dispenseAsWritten: props.store.dispenseAsWritten.value,
            dispenseQuantity: props.store.dispenseQuantity.value,
            dispenseUnit: props.store.dispenseUnit.value,
            daysSupply: props.store.daysSupply.value,
            refillsInput: props.store.refillsInput.value,
            instructions: props.store.instructions.value,
            notes: props.store.notes.value,
            fillsAllowed: props.store.refillsInput.value + 1,
            addToTemplates: props.store.addToTemplates?.value ?? false,
            catalogId: props.store.catalogId.value ?? undefined
          }
        ]
      });
      props.actions.updateFormValue({
        key: 'effectiveDate',
        value: format(new Date(), 'yyyy-MM-dd').toString()
      });
      props.actions.clearKeys([
        'treatment',
        'dispenseAsWritten',
        'dispenseQuantity',
        'dispenseUnit',
        'daysSupply',
        'refillsInput',
        'instructions',
        'notes'
      ]);
      setOffCatalog(undefined);
      clearForm(
        props.actions,
        props.weight ? { notes: patientWeight(props.weight, props?.weightUnit) } : undefined
      );
      triggerToast({
        status: 'success',
        header: 'Prescription Added',
        body: 'You can send this order or add another prescription before sending it'
      });
      if (props.store.addToTemplates?.value) {
        triggerToast({
          status: 'success',
          header: 'Personal template saved'
        });
      }
    } else {
      triggerToast({
        status: 'info',
        body: 'Some items in the form are incomplete, please check for errors'
      });
    }
  };

  return (
    <div ref={ref}>
      <style>{photonStyles}</style>
      <Card>
        <div class="flex items-center justify-between">
          <Text color="gray">Add Prescription</Text>
          <photon-med-search-dialog
            title="Advanced Medication Search"
            open={medDialogOpen()}
            on:photon-medication-closed={() => setMedDialogOpen(false)}
          />
        </div>

        <div
          class="flex flex-col sm:gap-3"
          on:photon-medication-selected={(e: any) => {
            setMedDialogOpen(false);
            setOffCatalog(e.detail.medication);
            props.actions.updateFormValue({
              key: 'treatment',
              value: e.detail.medication
            });
          }}
        >
          <photon-treatment-select
            label="Search Treatment Catalog"
            selected={props.store.treatment?.value ?? undefined}
            invalid={props.store.treatment?.error ?? false}
            help-text={props.store.treatment?.error}
            off-catalog-option={offCatalog()}
            on:photon-treatment-selected={(e: any) => {
              if (e.detail.data.__typename === 'PrescriptionTemplate') {
                repopulateForm(props.actions, {
                  ...e.detail.data,
                  notes: [
                    e.detail.data?.notes,
                    props.weight && patientWeight(props.weight, props?.weightUnit)
                  ]
                    .filter((x) => x)
                    .join('\n\n')
                });
              } else {
                props.actions.updateFormValue({
                  key: 'treatment',
                  value: e.detail.data
                });
              }
              props.actions.updateFormValue({
                key: 'catalogId',
                value: e.detail.catalogId
              });
            }}
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
            <div class="pb-4 md:py-2 text-left sm:text-right">
              <a
                class="font-sans text-gray-500 text-sm hover:text-black hover:cursor-pointer"
                onClick={() => setMedDialogOpen(true)}
              >
                Advanced Search →
              </a>
            </div>
          </div>
          <div class="mt-2 sm:mt-0 w-full md:pr-2">
            <photon-datepicker
              label="Do Not Fill Before"
              invalid={props.store.effectiveDate?.error ?? false}
              help-text={props.store.effectiveDate?.error}
              required="true"
              on:photon-datepicker-selected={(e: any) =>
                props.actions.updateFormValue({
                  key: 'effectiveDate',
                  value: e.detail.date
                })
              }
            />
          </div>
          <div class="mt-2 sm:mt-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div class="flex items-end gap-1 items-stretch">
              <photon-number-input
                class="flex-grow flex-1 w-2/5 sm:w-auto"
                label="Quantity"
                value={props.store.dispenseQuantity?.value ?? null}
                required="true"
                min={1}
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
                    height: '40px'
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
              on:photon-dispense-unit-selected={(e: any) =>
                props.actions.updateFormValue({
                  key: 'dispenseUnit',
                  value: e.detail.dispenseUnit.name
                })
              }
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
              value={props.store.refillsInput?.value ?? 0}
              required="true"
              min={0}
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
          <div class="flex flex-col xs:flex-row gap-2">
            <Show when={!props.hideAddToTemplates}>
              <photon-checkbox
                label="Add To Personal Templates"
                form-name="daw"
                checked={props.store.addToTemplates?.value || false}
                on:photon-checkbox-toggled={(e: any) =>
                  props.actions.updateFormValue({
                    key: 'addToTemplates',
                    value: e.detail.checked
                  })
                }
              />
            </Show>
            <div class="flex flex-grow justify-end">
              <Button class="w-full md:!w-auto" size="lg" onClick={handleAddPrescription}>
                Add Prescription
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
