import { For, Show, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import InputGroup from '../../particles/InputGroup';
import { PharmacyStore } from '../../stores/pharmacy';
import ComboBox from '../../particles/ComboBox';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import LocationSelect from '../LocationSelect';
import Icon from '../../particles/Icon';
import Button from '../../particles/Button';

export interface PharmacyProps {
  address?: string;
  patientId?: string;
  geocodingApiKey?: string;
  setPharmacy: (pharmacy: any) => void;
}

export default function PharmacySearch(props: PharmacyProps) {
  const { store, actions } = PharmacyStore;
  const [selected, setSelected] = createSignal<any>();
  const [query, setQuery] = createSignal('');

  const hasFoundPharmacies = createMemo(() => store.pharmacies.data.length > 0);

  const filteredPharmacies = createMemo(() => {
    if (!hasFoundPharmacies()) {
      return [];
    }

    return query() === ''
      ? store.pharmacies.data
      : store.pharmacies.data.filter((pharmacy) => {
          return pharmacy.name.toLowerCase().includes(query().toLowerCase());
        });
  });

  const handleResetAddress = () => {
    if (props?.setPharmacy) {
      props.setPharmacy(undefined);
    }
    actions.clearPharmacies();
  };

  createEffect(() => {
    if (selected()?.id) {
      setQuery('');
      props?.setPharmacy?.(selected());
    }
  });

  const formattedAddress = (pharmacy: {
    id: string;
    address: { street1: string; city: string; state: string };
  }) =>
    `${capitalizeFirstLetter(pharmacy.address?.street1 || '')}, ${capitalizeFirstLetter(
      pharmacy.address?.city || ''
    )}, ${pharmacy.address?.state}`;

  return (
    <div>
      <Show when={!hasFoundPharmacies()}>
        <InputGroup label="Select a location">
          <LocationSelect />
        </InputGroup>
      </Show>
      <Show when={hasFoundPharmacies()}>
        <InputGroup
          label="Select a pharmacy"
          helpText={
            <Button
              variant="naked"
              onClick={handleResetAddress}
              iconLeft={<Icon name="mapPin" size="sm" />}
            >
              {store?.pharmacies?.address || '...'}{' '}
            </Button>
          }
        >
          <ComboBox value={store.pharmacies.data?.[0] || undefined} setSelected={setSelected}>
            <ComboBox.Input
              onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
              displayValue={(pharmacy) => `${pharmacy.name}, ${formattedAddress(pharmacy)}`}
            />
            <ComboBox.Options>
              <For each={filteredPharmacies()}>
                {(pharmacy) => {
                  return (
                    <ComboBox.Option key={pharmacy.id} value={pharmacy}>
                      <div>{pharmacy.name}</div>
                      <div class="text-xs">{formattedAddress(pharmacy)}</div>
                    </ComboBox.Option>
                  );
                }}
              </For>
            </ComboBox.Options>
          </ComboBox>
        </InputGroup>
      </Show>
    </div>
  );
}
