import { Medication } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal, untrack } from 'solid-js';
import { usePhoton } from '../../context';
import { PhotonDropdown } from '../../photon-dropdown';

export const MedicationFormDropdown = (props: { disabled: boolean; medicationId: string }) => {
  const client = usePhoton();
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [uid, setUid] = createSignal<string>();
  const [setFilterText] = createSignal<string>('');
  const [data, setData] = createSignal<Medication[]>([]);

  const dispatchFormSelected = (id: string) => {
    const event = new CustomEvent('photon-form-selected', {
      composed: true,
      bubbles: true,
      detail: {
        formId: id
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchFormDeselected = () => {
    const event = new CustomEvent('photon-form-deselected', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  createEffect(async () => {
    actionRef.clear();
    if (props.medicationId.length > 0) {
      setIsLoading(true);
      untrack(async () => {
        const id = String(Math.random());
        setUid(id);
        const { data } = await client!.getSDK().clinical.searchMedication.getForms({
          id: props.medicationId
        });
        if (id === uid()) {
          setData(data.medicationForms ?? []);
        }
        setIsLoading(false);
      });
    }
  }, [props.medicationId]);

  const actionRef: any = {};

  let ref: any;

  return (
    <div
      class="w-full"
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchFormSelected(e.detail.data.id);
      }}
      on:photon-data-unselected={() => {
        dispatchFormDeselected();
      }}
    >
      <PhotonDropdown
        actionRef={actionRef}
        data={data()}
        label={'Form'}
        disabled={props.disabled}
        placeholder="Select a form..."
        isLoading={isLoading()}
        hasMore={false}
        displayAccessor={(p) => p.form}
        onSearchChange={async (s: string) => setFilterText(s)}
        onHide={async () => {
          setFilterText('');
        }}
        noDataMsg={'No forms found'}
        required={false}
      ></PhotonDropdown>
    </div>
  );
};
