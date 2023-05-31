import { customElement } from 'solid-element';

//Photon
import '../photon-form';
import '../photon-button';
import '../photon-authenticated';

//Shoelace
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/button/button';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline';
import { createEffect, createSignal } from 'solid-js';
import { usePhoton } from '../context';
import { debounce } from '@solid-primitives/scheduled';

customElement('photon-prescribe-form', {}, (_, options) => {
  let ref: any;
  let formRef: any;
  const [success, setSuccess] = createSignal(false);
  const [delayedSuccess, setDelayedSuccess] = createSignal(false);
  const debounceDelayedSuccess = debounce((success: boolean) => setDelayedSuccess(success), 400);
  const [error, setError] = createSignal(false);
  const [delayedError, setDelayedError] = createSignal(false);
  const debounceDelayedError = debounce((error: boolean) => setDelayedError(error), 400);
  const client = usePhoton();

  const dispatchSuccess = () => {
    const event = new CustomEvent('photon-prescribe-success', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  const dispatchError = () => {
    const event = new CustomEvent('photon-prescribe-error', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  const submitForm = async (d: Map<string, any>) => {
    formRef.setLoading(true);
    const result = await client?.clinical.prescription.createPrescription({
      patientId: d.get('patient'),
      treatmentId: d.get('treatment'),
      dispenseAsWritten: d.get('daw'),
      effectiveDate: d.get('effective_date'),
      dispenseQuantity: d.get('quantity'),
      dispenseUnit: d.get('dispense_unit'),
      daysSupply: d.get('days_supply'),
      // fillsAllowed was not tested here because this form is deprecated. if used in the future, please confirm fillsAllowed is correct
      fillsAllowed: d.get('refills') + 1,
      instructions: d.get('patient_instructions'),
      notes: d.get('pharmacy_note')
    });
    formRef.setLoading(false);
    if (result!.errors && result!.errors.length > 0) {
      setSuccess(false);
      debounceDelayedSuccess(false);
      setError(true);
      debounceDelayedError(true);
    } else if (result!.data && result!.data.createPrescription) {
      setSuccess(true);
      debounceDelayedSuccess(true);
      setError(false);
      debounceDelayedError(false);
    } else {
      setSuccess(false);
      debounceDelayedSuccess(false);
      setError(true);
      debounceDelayedError(true);
    }
  };

  createEffect(() => {
    if (delayedSuccess()) {
      dispatchSuccess();
    }
  });

  createEffect(() => {
    if (delayedError()) {
      dispatchError();
    }
  });

  options.element['resetForm'] = () => {
    formRef.resetForm();
    setSuccess(false);
    debounceDelayedSuccess(false);
    setError(false);
    debounceDelayedError(false);
  };

  return (
    <div ref={ref} class="flex flex-col">
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <div
        classList={{
          'fade-out': success() || error(),
          hidden: delayedSuccess() || delayedError()
        }}
      >
        <photon-form
          ref={formRef}
          submit-label="Create Prescription"
          on:photon-submit-success={async (e: any) => await submitForm(e.detail.data)}
        >
          <photon-patient-select label="Patient" required="true" />
          <photon-treatment-select
            label="Treatment"
            required="true"
            on:photon-treatment-selected={(e: any) => {
              if (e.detail.data.__typename === 'PrescriptionTemplate') {
                const formData = formRef.getForm();
                if (e.detail.data.dispenseAsWritten != undefined) {
                  formData.set('daw', e.detail.data.dispenseAsWritten);
                }
                if (e.detail.data.dispenseQuantity) {
                  formData.set('quantity', e.detail.data.dispenseQuantity);
                }
                if (e.detail.data.daysSupply) {
                  formData.set('days_supply', e.detail.data.daysSupply);
                }
                if (e.detail.data.dispenseUnit) {
                  formData.set('dispense_unit', e.detail.data.dispenseUnit);
                }
                if (e.detail.data.instructions) {
                  formData.set('patient_instructions', e.detail.data.instructions);
                }
                if (e.detail.data.notes) {
                  formData.set('pharmacy_note', e.detail.data.notes);
                }
                if (e.detail.data.refillsAllowed) {
                  formData.set('refills', e.detail.data.refillsAllowed);
                }
                formRef.updateForm(formData);
              }
            }}
          />
          <photon-checkbox label="Dispense as written" form-name="daw" />
          <photon-datepicker label="Effective Date" required="true" />
          <div class="flex flex-col sm:flex-wrap sm:flex-row sm:items-center sm:gap-x-4">
            <photon-number-input
              class="flex-grow flex-shrink md:max-w-[50%] flex-1"
              label="Quantity"
              min="1"
              value="1"
              required="true"
            />
            <photon-dispense-units
              class="flex-grow flex-shrink md:max-w-[50%] flex-1"
              label="Dispense Unit"
              required="true"
              force-label-size="true"
            />
          </div>
          <div class="flex flex-col sm:flex-wrap sm:flex-row sm:items-center sm:gap-x-4">
            <photon-number-input
              class="flex-grow flex-shrink md:max-w-[50%] flex-1"
              label="Days Supply"
              min="0"
              value="30"
              required="true"
            />
            <photon-number-input
              class="flex-grow flex-shrink md:max-w-[50%] flex-1"
              label="Refills"
              min="0"
              value="0"
              required="true"
            />
          </div>
          <photon-textarea
            label="Patient Instructions (SIG)"
            form-name="patient_instructions"
            required="true"
            placeholder="Enter patient instructions"
          />
          <photon-textarea label="Pharmacy Note" placeholder="Enter pharmacy note" />
        </photon-form>
      </div>
      <div
        classList={{
          'fade-in': success(),
          hidden: !success()
        }}
        class="flex flex-col items-center gap-4 p-4"
      >
        <sl-icon name="check-circle" class="text-green-500 text-7xl" />
        <p class="text-gray-700">
          Prescription {client?.clinical.prescription.state.data?.id} successfully created
        </p>
      </div>
      <div
        classList={{
          'fade-in': error(),
          hidden: !error()
        }}
        class="flex flex-col items-center gap-4 p-4"
      >
        <sl-icon name="x-circle" class="text-red-500 text-7xl" />
        <p class="text-gray-700">
          We received the following error while creating your prescription:
        </p>
        <code class="bg-gray-800 text-gray-300 p-4 rounded-lg">
          {error()
            ? client?.clinical.prescription.state.errors &&
              client?.clinical.prescription.state.errors.length > 0
              ? client?.clinical.prescription.state.errors[0].message
              : client?.clinical.prescription.state.error.message
            : null}
        </code>
        <photon-button
          on:photon-clicked={() => {
            debounceDelayedSuccess(false);
            setSuccess(false);
            debounceDelayedError(false);
            setError(false);
          }}
        >
          <sl-icon slot="suffix" name="arrow-left-short" />
          Go back
        </photon-button>
      </div>
    </div>
  );
});
