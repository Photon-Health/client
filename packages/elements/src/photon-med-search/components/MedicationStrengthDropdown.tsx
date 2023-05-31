import { SearchMedication } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal, untrack } from 'solid-js';
import { usePhoton } from '../../context';
import { PhotonDropdown } from '../../photon-dropdown';

export const MedicationStrengthDropdown = (props: { disabled: boolean; medicationId: string }) => {
  const client = usePhoton();
  const [uid, setUid] = createSignal<string>();
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [setFilterText] = createSignal<string>('');
  const [data, setData] = createSignal<SearchMedication[]>([]);

  const dispatchStrengthSelected = (id: string) => {
    const event = new CustomEvent('photon-strength-selected', {
      composed: true,
      bubbles: true,
      detail: {
        strengthId: id
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchStrengthDeselected = () => {
    const event = new CustomEvent('photon-strength-deselected', {
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
        const { data } = await client!.getSDK().clinical.searchMedication.getStrengths({
          id: props.medicationId
        });
        if (id === uid()) {
          setData(data.medicationStrengths ?? []);
        }
        setIsLoading(false);
      });
    }
  });

  const actionRef: any = {};

  let ref: any;

  return (
    <div
      class="w-full"
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchStrengthSelected(e.detail.data.id);
      }}
      on:photon-data-unselected={() => {
        dispatchStrengthDeselected();
      }}
    >
      <PhotonDropdown
        actionRef={actionRef}
        data={data()}
        label={'Strength'}
        disabled={props.disabled}
        placeholder="Select a strength..."
        isLoading={isLoading()}
        hasMore={false}
        displayAccessor={(p) => p?.name || ''}
        onSearchChange={async (s: string) => setFilterText(s)}
        onHide={async () => {
          setFilterText('');
        }}
        noDataMsg={'No strengths found'}
        required={false}
      />
    </div>
  );
};
