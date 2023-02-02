import { createSignal } from 'solid-js';
import { PhotonDropdown } from '../../photon-dropdown';

type VolumeUnit = {
  id: string;
  name: string;
};
const units: VolumeUnit[] = [
  {
    id: 'mL',
    name: 'mL',
  },
  {
    id: 'L',
    name: 'L',
  },
];

export const VolumeUnitsDropdown = () => {
  const [filterText, setFilterText] = createSignal<string>('');

  const dispatchFormSelected = (unit: string) => {
    const event = new CustomEvent('photon-unit-selected', {
      composed: true,
      bubbles: true,
      detail: {
        unit: unit,
      },
    });
    ref?.dispatchEvent(event);
  };

  let ref: any;

  return (
    <div
      class="min-w-[125px]"
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchFormSelected(e.detail.data.name);
      }}
    >
      <PhotonDropdown
        data={units.filter((x) => x.name.includes(filterText()))}
        forceLabelSize={true}
        isLoading={false}
        disabled={false}
        placeholder="Select a unit..."
        hasMore={false}
        displayAccessor={(p) => p.name}
        onSearchChange={async (s: string) => setFilterText(s)}
        onHide={async () => {
          setFilterText('');
        }}
        noDataMsg={'No units found'}
        required={false}
        selectedData={units[0]}
      ></PhotonDropdown>
    </div>
  );
};
