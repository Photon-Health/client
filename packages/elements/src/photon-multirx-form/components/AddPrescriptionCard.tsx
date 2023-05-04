import { afterDate, message } from '../../validators';
import { record, string, any, number, min, size } from 'superstruct';
import { format } from 'date-fns';
import { DispenseUnit, Medication } from '@photonhealth/sdk/dist/types';
import { DoseCalculator } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';

//Shoelace
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/button/button';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { createSignal, Show } from 'solid-js';
import repopulateForm from '../util/repopulateForm';

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

export const AddPrescriptionCard = (props: {
  hideAddToTemplates: boolean;
  actions: Record<string, Function>;
  store: Record<string, any>;
}) => {
  let medSearchRef: any;
  const [offCatalog, setOffCatalog] = createSignal<Medication | undefined>(undefined);
  const [dispenseUnit, setDispenseUnit] = createSignal<DispenseUnit | undefined>(undefined);
  const [openDoseCalculator, setOpenDoseCalculator] = createSignal(false);

  let ref: any;

  for (const [k, v] of Object.entries(validators)) {
    props.actions.registerValidator({
      key: k,
      validator: v
    });
  }

  return (
    <photon-card ref={ref} title={'Add Prescription'}>
      <style>{photonStyles}</style>
      <div
        class="flex flex-col sm:gap-3"
        on:photon-medication-selected={(e: any) => {
          setOffCatalog(e.detail.medication);
          props.actions.updateFormValue({
            key: 'treatment',
            value: e.detail.medication
          });
        }}
      >
        <photon-treatment-select
          label="Search Treatment Catalog"
          selected={props.store['treatment']?.value ?? undefined}
          invalid={props.store['treatment']?.error ?? false}
          help-text={props.store['treatment']?.error}
          off-catalog-option={offCatalog()}
          on:photon-treatment-selected={(e: any) => {
            if (e.detail.data.__typename === 'PrescriptionTemplate') {
              repopulateForm(props.actions, e.detail.data);
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
        ></photon-treatment-select>
        <div class="flex flex-col sm:flex-none sm:grid sm:grid-cols-2 sm:gap-4">
          <div class="order-last sm:order-first">
            <photon-checkbox
              label="Dispense as written"
              tip="This prescription will be filled generically unless this box is checked"
              form-name="daw"
              class="flex-grow"
              checked={props.store['dispenseAsWritten']?.value || false}
              on:photon-checkbox-toggled={(e: any) =>
                props.actions.updateFormValue({
                  key: 'dispenseAsWritten',
                  value: e.detail.checked
                })
              }
            ></photon-checkbox>
            <photon-med-search-dialog ref={medSearchRef}></photon-med-search-dialog>
          </div>
          <div class="pb-4 md:py-2 text-left sm:text-right">
            <a
              class="font-sans text-gray-500 text-sm hover:text-black hover:cursor-pointer"
              onClick={() => (medSearchRef.open = true)}
            >
              Advanced Search →
            </a>
          </div>
        </div>
        <div class="mt-2 sm:mt-0 md:max-w-[50%] md:pr-2">
          <photon-datepicker
            label="Effective Date"
            invalid={props.store['effectiveDate']?.error ?? false}
            help-text={props.store['effectiveDate']?.error}
            required="true"
            on:photon-datepicker-selected={(e: any) =>
              props.actions.updateFormValue({
                key: 'effectiveDate',
                value: e.detail.date
              })
            }
          ></photon-datepicker>
        </div>
        <div class="mt-2 sm:mt-0 sm:grid sm:grid-cols-2 sm:gap-4">
          <div class="flex items-end gap-1">
            <photon-number-input
              class="flex-grow flex-1 w-2/5 sm:w-auto"
              label="Quantity"
              value={props.store['dispenseQuantity']?.value ?? null}
              required="true"
              min={1}
              invalid={props.store['dispenseQuantity']?.error ?? false}
              help-text={props.store['dispenseQuantity']?.error}
              on:photon-input-changed={(e: any) => {
                props.actions.updateFormValue({
                  key: 'dispenseQuantity',
                  value: Number(e.detail.input)
                });
              }}
            ></photon-number-input>
            <DoseCalculator
              open={openDoseCalculator()}
              setClose={() => setOpenDoseCalculator(false)}
              medicationName={props.store['treatment']?.value?.name}
            ></DoseCalculator>
            <div>
              <photon-button
                variant="outline"
                class="w-fit"
                on:photon-clicked={() => setOpenDoseCalculator(true)}
              >
                <button onClick={() => setOpenDoseCalculator(true)}>
                  <sl-icon name="calculator"></sl-icon>
                </button>
              </photon-button>
              <div style={{ height: '23px' }} class="pt-1"></div>
            </div>
          </div>
          <photon-dispense-units
            label="Dispense Unit"
            required="true"
            force-label-size="true"
            selected={props.store['dispenseUnit']?.value ?? dispenseUnit()?.name}
            on:photon-dispense-unit-selected={(e: any) =>
              props.actions.updateFormValue({
                key: 'dispenseUnit',
                value: e.detail.dispenseUnit.name
              })
            }
          ></photon-dispense-units>
        </div>
        <div class="sm:grid sm:grid-cols-2 sm:gap-4">
          <photon-number-input
            class="flex-grow flex-shrink flex-1"
            label="Days Supply"
            value={props.store['daysSupply']?.value ?? null}
            invalid={props.store['daysSupply']?.error ?? false}
            help-text={props.store['daysSupply']?.error}
            required="true"
            min={0}
            on:photon-input-changed={(e: any) => {
              props.actions.updateFormValue({
                key: 'daysSupply',
                value: Number(e.detail.input)
              });
            }}
          ></photon-number-input>
          <photon-number-input
            class="flex-grow flex-shrink flex-1"
            label="Refills"
            value={props.store['refillsInput']?.value ?? 0}
            required="true"
            min={0}
            invalid={props.store['refillsInput']?.error ?? false}
            help-text={props.store['refillsInput']?.error}
            on:photon-input-changed={(e: any) =>
              props.actions.updateFormValue({
                key: 'refillsInput',
                value: Number(e.detail.input)
              })
            }
          ></photon-number-input>
        </div>
        <photon-textarea
          label="Patient Instructions (SIG)"
          form-name="patient_instructions"
          required="true"
          placeholder="Enter patient instructions"
          invalid={props.store['instructions']?.error ?? false}
          help-text={props.store['instructions']?.error}
          on:photon-textarea-changed={(e: any) =>
            props.actions.updateFormValue({
              key: 'instructions',
              value: e.detail.value
            })
          }
          value={props.store['instructions']?.value}
        ></photon-textarea>
        <photon-textarea
          label="Pharmacy Note"
          placeholder="Enter pharmacy note"
          on:photon-textarea-changed={(e: any) =>
            props.actions.updateFormValue({
              key: 'notes',
              value: e.detail.value
            })
          }
          value={props.store['notes']?.value}
        ></photon-textarea>
        <div class="flex flex-col xs:flex-row gap-2">
          <Show when={!props.hideAddToTemplates}>
            <photon-checkbox
              label="Add To Templates"
              form-name="daw"
              checked={props.store['addToTemplates']?.value || false}
              on:photon-checkbox-toggled={(e: any) =>
                props.actions.updateFormValue({
                  key: 'addToTemplates',
                  value: e.detail.checked
                })
              }
            ></photon-checkbox>
          </Show>
          <div class="flex flex-grow justify-end">
            <photon-button
              class="w-full xs:w-fit"
              on:photon-clicked={() => {
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
                      ...(props.store['draftPrescriptions']?.value || []),
                      {
                        id: String(Math.random()),
                        effectiveDate: props.store['effectiveDate'].value,
                        treatment: props.store['treatment'].value,
                        dispenseAsWritten: props.store['dispenseAsWritten'].value,
                        dispenseQuantity: props.store['dispenseQuantity'].value,
                        dispenseUnit: props.store['dispenseUnit'].value,
                        daysSupply: props.store['daysSupply'].value,
                        refillsInput: props.store['refillsInput'].value,
                        instructions: props.store['instructions'].value,
                        notes: props.store['notes'].value,
                        fillsAllowed: props.store['refillsInput'].value + 1,
                        addToTemplates: props.store['addToTemplates']?.value ?? false,
                        catalogId: props.store['catalogId'].value ?? undefined
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
                  props.actions.updateFormValue({
                    key: 'treatment',
                    value: undefined
                  });
                  props.actions.updateFormValue({
                    key: 'refillsInput',
                    value: 0
                  });
                  props.actions.updateFormValue({
                    key: 'dispenseAsWritten',
                    value: false
                  });
                  props.actions.updateFormValue({
                    key: 'dispenseQuantity',
                    value: null
                  });
                  props.actions.updateFormValue({
                    key: 'daysSupply',
                    value: null
                  });
                  props.actions.updateFormValue({
                    key: 'instructions',
                    value: ''
                  });
                  props.actions.updateFormValue({
                    key: 'notes',
                    value: ''
                  });
                }
              }}
            >
              Add Prescription
            </photon-button>
          </div>
        </div>
      </div>
    </photon-card>
  );
};
