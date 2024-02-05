//Solid
import { customElement } from 'solid-element';

//Photon
import { PhotonDropdown } from '../photon-dropdown';

//Types
import { createMemo, createSignal, onMount } from 'solid-js';
import { usePhotonWrapper } from '../store-context';
import { DispenseUnitStore, StoreDispenseUnit } from '../stores/dispenseUnit';

customElement(
  'photon-dispense-units',
  {
    label: undefined,
    required: false,
    invalid: false,
    helpText: undefined,
    formName: undefined,
    disabled: false,
    forceLabelSize: false,
    selected: undefined
  },
  (props: {
    label?: string;
    required: boolean;
    invalid: boolean;
    helpText?: string;
    formName?: string;
    disabled: boolean;
    forceLabelSize: boolean;
    selected?: string;
  }) => {
    let ref: any;
    //context
    const photon = usePhotonWrapper();
    const { store, actions } = DispenseUnitStore;
    const [filter, setFilter] = createSignal<string>('');

    const dispatchSelected = (dispenseUnit: StoreDispenseUnit) => {
      const event = new CustomEvent('photon-dispense-unit-selected', {
        composed: true,
        bubbles: true,
        detail: {
          dispenseUnit: {
            name: dispenseUnit.name
          }
        }
      });
      ref?.dispatchEvent(event);
    };

    onMount(async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await actions.getDispenseUnits(photon!().getSDK());
    });

    const getData = (filter: string): StoreDispenseUnit[] => {
      if (store.dispenseUnits.data.length > 0) {
        const data = store.dispenseUnits.data;
        if (filter.length === 0) {
          return data;
        }
        return data.filter((x) => x.name.toLowerCase().includes(filter.toLowerCase()));
      }
      return [];
    };

    const selectedData = createMemo(() =>
      props.selected
        ? store.dispenseUnits.data?.find((x) => x.name === props.selected)
        : store.dispenseUnits.data?.[0]
    );

    return (
      <div
        ref={ref}
        on:photon-data-selected={(e: any) => {
          dispatchSelected(e.detail.data);
        }}
      >
        <PhotonDropdown
          data={getData(filter())}
          label={props.label}
          disabled={props.disabled}
          required={props.required}
          forceLabelSize={props.forceLabelSize}
          placeholder="Select a dispense unit..."
          invalid={props.invalid}
          isLoading={photon?.().clinical.dispenseUnits.state.isLoading || false}
          hasMore={false}
          selectedData={selectedData()}
          displayAccessor={(t) => t?.name || ''}
          onSearchChange={setFilter}
          onHide={() => setFilter('')}
          noDataMsg={'No dispense units found'}
          helpText={props.helpText}
        />
      </div>
    );
  }
);
