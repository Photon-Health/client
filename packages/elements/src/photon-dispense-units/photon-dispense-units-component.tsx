//Solid
import { customElement } from 'solid-element';

//Photon
import { usePhoton } from '@photonhealth/components';
import { PhotonDropdown } from '../photon-dropdown';

//Types
import { createSignal, onMount } from 'solid-js';
import { DispenseUnitStore, StoreDispenseUnit } from '../stores/dispenseUnit';

const Component = (props: {
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
  const client = usePhoton();
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
    await actions.getDispenseUnits(client!.getSDK());
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
        isLoading={client?.clinical.dispenseUnits.state.isLoading || false}
        hasMore={false}
        selectedData={
          props.selected
            ? store.dispenseUnits.data?.filter((x) => x.name === props.selected)[0]
            : undefined
        }
        displayAccessor={(t) => t?.name || ''}
        onSearchChange={async (s: string) => {
          setFilter(s);
        }}
        onHide={async () => {
          setFilter('');
        }}
        noDataMsg={'No dispense units found'}
        helpText={props.helpText}
      />
    </div>
  );
};
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
  Component
);
