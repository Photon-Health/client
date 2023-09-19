import { Medication } from '@photonhealth/sdk/dist/types';
import { customElement } from 'solid-element';
import { createSignal } from 'solid-js';
import { usePhoton } from '../context';

customElement(
  'photon-med-search-dialog',
  {
    open: {
      value: false,
      reflect: true,
      notify: false,
      attribute: 'open',
      parse: true
    }
  },
  (props: { open: boolean }) => {
    const client = usePhoton();
    let ref: any;
    const [medication, setMedication] = createSignal<Medication | undefined>(undefined);
    const [addToCatalog, setAddToCatalog] = createSignal<boolean>(false);
    const [catalogId, setCatalogId] = createSignal<string>('');
    const [loading, setLoading] = createSignal<boolean>(false);

    const dispatchMedicationSelected = () => {
      const event = new CustomEvent('photon-medication-selected', {
        composed: true,
        bubbles: true,
        detail: {
          medication: medication()
        }
      });
      ref?.dispatchEvent(event);
    };

    const handleConfirm = async () => {
      setLoading(true);
      if (addToCatalog()) {
        const addCatalogMutation = client!.getSDK().clinical.catalog.addToCatalog({});
        try {
          await addCatalogMutation({
            variables: {
              catalogId: catalogId(),
              treatmentId: medication()?.id
            },
            awaitRefetchQueries: false
          });
        } catch (e: any) {
          console.log('Error adding to catalog: ', e?.message);
        }
      }
      dispatchMedicationSelected();
      setLoading(false);
      props.open = false;
    };
    const handleCancel = () => {
      props.open = false;
    };

    return (
      <div
        ref={ref}
        on:photon-form-updated={(e: any) => {
          setMedication(e.detail.medication);
          setAddToCatalog(e.detail.addToCatalog);
          setCatalogId(e.detail.catalogId);
        }}
      >
        <photon-dialog
          open={props.open}
          loading={loading()}
          cancel-text="Back"
          confirm-text="Select Medication"
          disable-submit={!medication()}
          on:photon-dialog-confirmed={handleConfirm}
          on:photon-dialog-canceled={handleCancel}
          on:photon-dialog-alt={handleCancel}
        >
          <photon-med-search open={props.open} />
        </photon-dialog>
      </div>
    );
  }
);
