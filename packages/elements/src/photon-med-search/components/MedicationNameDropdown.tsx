import { SearchMedication } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal, untrack } from 'solid-js';
import { usePhoton } from '../../context';
import { PhotonDropdown } from '../../photon-dropdown';

export const MedicationNameDropdown = () => {
  let ref: any;
  const client = usePhoton();
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [filterText, setFilterText] = createSignal<string>('');
  const [uid, setUid] = createSignal<string>();
  const [data, setData] = createSignal<SearchMedication[]>([]);

  const dispatchMedSelected = (id: string) => {
    const event = new CustomEvent('photon-name-selected', {
      composed: true,
      bubbles: true,
      detail: {
        medicationId: id,
      },
    });
    ref?.dispatchEvent(event);
  };

  createEffect(async () => {
    if (filterText().length > 0) {
      setIsLoading(true);
      untrack(async () => {
        const id = String(Math.random());
        setUid(id);
        const { data } = await client!.getSDK().clinical.searchMedication.getConcepts({
          name: filterText(),
        });
        if (id === uid()) {
          setData(data.medicationConcepts ?? []);
        }
        setIsLoading(false);
      });
    }
  }, [filterText]);

  return (
    <div
      class="w-full"
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchMedSelected(e.detail.data.id);
      }}
    >
      <PhotonDropdown
        data={data()}
        label={'Medication Name'}
        placeholder="Enter a medication name..."
        isLoading={isLoading()}
        hasMore={false}
        displayAccessor={(p) => p.name}
        onSearchChange={async (s: string) => setFilterText(s)}
        onHide={async () => {
          setFilterText('');
        }}
        noDataMsg={'No medications found'}
        required={false}
      ></PhotonDropdown>
    </div>
  );
};
