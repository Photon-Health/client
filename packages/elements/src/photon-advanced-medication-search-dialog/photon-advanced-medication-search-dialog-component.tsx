import { Medication, SearchMedication } from '@photonhealth/sdk/dist/types';
import { Button, Dialog } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { customElement } from 'solid-element';
import { createSignal, createEffect } from 'solid-js';

type AdvancedMedicationSearchDialogProps = {
  open: boolean;
  title?: string;
};

const Component = (props: AdvancedMedicationSearchDialogProps) => {
  let ref: any;
  const [medication, setMedication] = createSignal<Medication | SearchMedication | undefined>(
    undefined
  );
  const [submitting, setSubmitting] = createSignal(false);

  const dispatchMedicationSelected = () => {
    const event = new CustomEvent('photon-medication-selected', {
      composed: true,
      bubbles: true,
      detail: { medication: medication() }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchMedicationClosed = () => {
    const event = new CustomEvent('photon-medication-closed', {
      composed: true,
      bubbles: true
    });
    ref?.dispatchEvent(event);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    dispatchMedicationSelected();
  };

  createEffect(() => {
    if (!props.open) {
      setSubmitting(false);
    }
  });

  const handleCancel = () => {
    dispatchMedicationClosed();
  };

  return (
    <div
      ref={ref}
      on:photon-form-updated={(e: any) => {
        setMedication(e.detail.medication);
      }}
    >
      <style>{photonStyles}</style>
      <Dialog open={props.open} onClose={handleCancel} size="lg">
        <p class="text-lg font-semibold mt-0 mb-4">{props.title || 'Select a Medication'}</p>
        <photon-advanced-medication-search open={props.open} />
        <div class="mt-5 flex gap-4 justify-end">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!medication()} loading={submitting()}>
            Select Medication
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

customElement(
  'photon-advanced-medication-search-dialog',
  {
    open: { value: false, reflect: true, notify: false, attribute: 'open', parse: true },
    title: ''
  },
  Component
);
