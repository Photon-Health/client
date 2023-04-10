import { For, Show, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import InputGroup from '../../particles/InputGroup';
import Input from '../../particles/Input';
import loadGoogleScript from '../../utils/loadGoogleScript';
import { PharmacyStore } from '../../stores/pharmacy';
import { usePhoton } from '../../context';
import ComboBox from '../../particles/ComboBox';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import Button from '../../particles/Button';

export interface PharmacyProps {
  address?: string;
  patientId?: string;
  geocodingApiKey?: string;
  setPharmacy?: (pharmacy: any) => void;
}

export default function PharmacySearch(props: PharmacyProps) {
  const client = usePhoton();
  const { store, actions } = PharmacyStore;
  const [address, setAddress] = createSignal(props.address || '');
  const [addressError, setAddressError] = createSignal('');
  const [query, setQuery] = createSignal('');
  let geocoder: google.maps.Geocoder | undefined;

  onMount(async () => {
    loadGoogleScript({
      onLoad: async () => {
        geocoder = new google.maps.Geocoder();

        if (props.address) {
          await actions.getPharmaciesByAddress(client!.getSDK(), geocoder!, String(address()));
        }
      },
      onError: (err) => {
        setAddressError(err);
      }
    });
  });

  const handleAddressSubmit = async (e: Event) => {
    e.preventDefault();
    await actions.getPharmaciesByAddress(client!.getSDK(), geocoder!, String(address()));
  };

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

  return (
    <div>
      <Show when={!hasFoundPharmacies()}>
        <form onSubmit={handleAddressSubmit}>
          <InputGroup label="Enter an address or zip code" error={addressError()}>
            <Input type="text" value={address()} onInput={(e) => setAddress(e.target?.value)} />
          </InputGroup>
        </form>
      </Show>
      <Show when={hasFoundPharmacies()}>
        <InputGroup
          label="Select a pharmacy"
          helpText={
            <div>
              Showing Pharmacies near {store?.pharmacies?.address || '...'}{' '}
              <Button size="xs" variant="secondary" onClick={() => actions.clearPharmacies()}>
                change
              </Button>
            </div>
          }
        >
          <ComboBox setSelected={props?.setPharmacy}>
            <ComboBox.Input onInput={(e) => setQuery((e.target as HTMLInputElement).value)} />
            <ComboBox.Options>
              <For each={filteredPharmacies()}>
                {(pharmacy) => {
                  const formattedAddress = `${capitalizeFirstLetter(
                    pharmacy.address?.street1 || ''
                  )}, ${capitalizeFirstLetter(pharmacy.address?.city || '')}, ${
                    pharmacy.address?.state
                  }`;
                  return (
                    <ComboBox.Option
                      key={pharmacy.id}
                      value={`${pharmacy.name}, ${formattedAddress}`}
                    >
                      <div>{pharmacy.name}</div>
                      <div class="text-xs">{formattedAddress}</div>
                    </ComboBox.Option>
                  );
                }}
              </For>
            </ComboBox.Options>
          </ComboBox>
        </InputGroup>
        <div></div>
      </Show>
    </div>
  );
}
