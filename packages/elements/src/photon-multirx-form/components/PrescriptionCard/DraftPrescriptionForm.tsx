import {
  Button,
  CALENDAR_DATE_FORMAT,
  Checkbox,
  DispenseUnitSelect,
  DoseCalculator,
  Icon,
  Input,
  InputGroup,
  PrescriptionFormData,
  ScreeningAlerts,
  ScreeningAlertType,
  Textarea,
  triggerToast,
  TryCreatePrescriptionTemplateOptions,
  useDraftPrescriptions,
  usePrescribeEventDispatch
} from '@photonhealth/components';
import { Medication, Prescription } from '@photonhealth/sdk/dist/types';
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
import { format } from 'date-fns';
import { GraphQLFormattedError } from 'graphql';
import { createEffect, createSignal, onMount, Show } from 'solid-js';
import clearForm from './util/clearForm';
import repopulateForm from './util/repopulateForm';
import { DisableList } from '../PrescribeWorkflow';
import { afterDate, message } from '../../../validators';
import { formatCharacterCount } from './util/formatCharacterCount';

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
  notes: message(
    refine(string(), 'Note length', (value) => value.length <= 210),
    'Note cannot be longer than 210 characters'
  ),
  doNotFillBeforeDate: message(
    optional(afterDate(new Date())),
    "Please choose a date that isn't in the past"
  )
};

export const DraftPrescriptionForm = (props: {
  hideAddToTemplates: boolean;
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  weight?: number;
  weightUnit?: string;
  prefillNotes?: string;
  screenDraftedPrescriptions: () => void;
  screeningAlerts: ScreeningAlertType[];
  catalogId?: string;
  allowOffCatalogSearch?: boolean;
  disableList?: DisableList;
  onHideForm: () => void;
}) => {
  const { tryCreatePrescription, draftPrescriptions } = useDraftPrescriptions();
  const { dispatchOrderError, dispatchAnalyticsTrackEvent } = usePrescribeEventDispatch();
  const [offCatalog, setOffCatalog] = createSignal<Medication | undefined>(undefined);
  const [openDoseCalculator, setOpenDoseCalculator] = createSignal(false);
  const [searchText, setSearchText] = createSignal<string>('');
  const [isLoading, setIsLoading] = createSignal(false);

  onMount(() => {
    for (const [k, v] of Object.entries(validators)) {
      props.actions.registerValidator({
        key: k,
        validator: v
      });
    }

    // initialize values in the prescribe form
    clearForm(props.actions, { notes: props.prefillNotes });
  });

  const handleTreatmentSelected = (e: any) => {
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
    dispatchAnalyticsTrackEvent('fieldInteraction', {
      name: 'Field Interaction',
      formName: 'add_prescription_form',
      fieldName: 'treatment',
      hasValue: true,
      isOptional: false
    });

    if (e.detail.catalogId) {
      props.actions.updateFormValue({
        key: 'catalogId',
        value: e.detail.catalogId
      });
    }

    props.screenDraftedPrescriptions();
  };

  const handleAddPrescription = async () => {
    setIsLoading(true);

    const keys = Object.keys(validators);
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

    const prescriptionFormData: PrescriptionFormData = {
      doNotFillBeforeDate: props.store.doNotFillBeforeDate?.value,
      treatment: { id: props.store.treatment.value.id, name: props.store.treatment.value.name },
      dispenseAsWritten: props.store.dispenseAsWritten.value,
      dispenseQuantity: props.store.dispenseQuantity.value,
      dispenseUnit: props.store.dispenseUnit.value,
      daysSupply: props.store.daysSupply.value,
      instructions: props.store.instructions.value,
      notes: props.store.notes.value,
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
        showSuccessToast: false
      };
      createdPrescription = await tryCreatePrescription(prescriptionFormData, options);
    } catch (err) {
      dispatchOrderError([err as GraphQLFormattedError]);
    } finally {
      setIsLoading(false);
    }

    if (!createdPrescription) {
      return;
    }

    props.onHideForm();

    // todo: move screening up to prescribeContext (for med history Refill button clicks)
    props.screenDraftedPrescriptions();

    // RESET THE FORM
    setOffCatalog(undefined);
    clearForm(props.actions, { notes: props.prefillNotes });

    setSearchText('');
  };

  const handleCancel = () => {
    props.onHideForm();
    clearForm(props.actions, { notes: props.prefillNotes });
  };

  createEffect(() => {
    if (props.store.treatment?.value) {
      setSearchText(props.store.treatment.value.name);
    }
  });

  return (
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
        on:photon-treatment-selected={handleTreatmentSelected}
        on:photon-treatment-unselected={() => {
          clearForm(props.actions, { notes: props.prefillNotes });

          props.screenDraftedPrescriptions();
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
            dispatchAnalyticsTrackEvent('fieldInteraction', {
              name: 'Field Interaction',
              formName: 'add_prescription_form',
              fieldName: 'dispenseAsWritten',
              hasValue: checked,
              isOptional: true
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
                onWheel={(e) => e.preventDefault()}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                  props.actions.updateFormValue({
                    key: 'dispenseQuantity',
                    value: Number(e.currentTarget.value)
                  });
                }}
                onBlur={(e) => {
                  dispatchAnalyticsTrackEvent('fieldInteraction', {
                    name: 'Field Interaction',
                    formName: 'add_prescription_form',
                    fieldName: 'dispenseQuantity',
                    hasValue: Boolean(e.currentTarget.value),
                    isOptional: false
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
              dispatchAnalyticsTrackEvent('fieldInteraction', {
                name: 'Field Interaction',
                formName: 'add_prescription_form',
                fieldName: 'dispenseUnit',
                hasValue: Boolean(e.currentTarget.value),
                isOptional: false
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
            onWheel={(e) => e.preventDefault()}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              props.actions.updateFormValue({
                key: 'daysSupply',
                value: Number(e.currentTarget.value)
              });
            }}
            onBlur={(e) => {
              dispatchAnalyticsTrackEvent('fieldInteraction', {
                name: 'Field Interaction',
                formName: 'add_prescription_form',
                fieldName: 'daysSupply',
                hasValue: Boolean(e.currentTarget.value),
                isOptional: true
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
            onWheel={(e) => e.preventDefault()}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              props.actions.updateFormValue({
                key: 'refills',
                value: Number(e.currentTarget.value)
              });
            }}
            onBlur={(e) => {
              dispatchAnalyticsTrackEvent('fieldInteraction', {
                name: 'Field Interaction',
                formName: 'add_prescription_form',
                fieldName: 'refills',
                hasValue: Boolean(e.currentTarget.value),
                isOptional: true
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
            dispatchAnalyticsTrackEvent('fieldInteraction', {
              name: 'Field Interaction',
              formName: 'add_prescription_form',
              fieldName: 'instructions',
              hasValue: Boolean(value),
              isOptional: false
            });
          }}
        />
      </InputGroup>
      <InputGroup
        label="Pharmacy Note"
        subLabel={formatCharacterCount(props.store.notes?.value?.length ?? 0)}
        showOptionalSubtext
        error={props.store.notes?.error}
      >
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
            dispatchAnalyticsTrackEvent('fieldInteraction', {
              name: 'Field Interaction',
              formName: 'add_prescription_form',
              fieldName: 'pharmacy_notes',
              hasValue: Boolean(value),
              isOptional: true
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
            dispatchAnalyticsTrackEvent('fieldInteraction', {
              name: 'Field Interaction',
              formName: 'add_prescription_form',
              fieldName: 'doNotFillBeforeDate',
              hasValue: Boolean(e.currentTarget.value),
              isOptional: true
            });
          }}
        />
      </InputGroup>
      <Show when={!props.hideAddToTemplates}>
        <div class="flex flex-col mt-4 gap-y-2">
          <Checkbox
            mainText="Add To Personal Templates"
            showOptionalSubtext
            checked={props.store.addToTemplates?.value || false}
            onChange={(checked: boolean) => {
              props.actions.updateFormValue({
                key: 'addToTemplates',
                value: checked
              });
              dispatchAnalyticsTrackEvent('fieldInteraction', {
                name: 'Field Interaction',
                formName: 'add_prescription_form',
                fieldName: 'addToTemplates',
                hasValue: checked,
                isOptional: true
              });
            }}
          />
          <Show when={props.store.addToTemplates?.value ?? false}>
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
          </Show>
        </div>
      </Show>
      <div class="w-full flex flex-col justify-end mt-6 gap-2 xs:flex-row-reverse xs:justify-start">
        <Button
          class="w-full xs:w-auto"
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
          Add prescription
        </Button>
        {/* Can only hide form if provider has added at least 1 draft */}
        {/*
          Can only hide and clear form if there is no in-progress prescription.
          This is a quick patch to address this flow:
          - Provider clicks edit button on a draft - form populated with draft, draft is discarded entirely
          - Provider clicks Cancel button - the current UI implies that Cancel button "cancels" the
            editing of the draft
          - Code hides and clears form > draft info is totally lost, which is unexpected behavior
          This patch means the provider cannot hide and clear form once they start filling it out,
          so if we get complaints we should implement a more robust solution.
        */}
        <Show when={draftPrescriptions().length > 0 && !props.store.treatment?.value}>
          <Button class="w-full xs:w-auto" size="lg" onClick={handleCancel} variant="secondary">
            Cancel
          </Button>
        </Show>
      </div>
    </div>
  );
};
