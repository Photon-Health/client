import { Show, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import InputGroup from '../../particles/InputGroup';
import Input from '../../particles/Input';
import loadGoogleScript from '../../utils/loadGoogleScript';
import { PharmacyStore } from '../../stores/pharmacy';
import { usePhoton } from '../../context';

export interface PharmacyProps {
  address?: string;
  patientId?: string;
  geocodingApiKey?: string;
}

export default function PharmacySearch(props: PharmacyProps) {
  const client = usePhoton();
  const { store, actions } = PharmacyStore;
  const [address, setAddress] = createSignal(props.address || '');
  const [addressError, setAddressError] = createSignal('');
  const [location, setLocation] = createSignal<google.maps.GeocoderResult>();
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

  createEffect(() => {
    console.log(store.pharmacies.data);
    console.log(location());
  });

  const hasFoundPharmacies = createMemo(() => store.pharmacies.data.length > 0);

  return (
    <div>
      <Show when={!hasFoundPharmacies()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log('handling', address());
          }}
        >
          <InputGroup label="Enter an address or zip code" error={addressError()}>
            <Input type="text" value={address()} onInput={(e) => setAddress(e.target?.value)} />
          </InputGroup>
        </form>
      </Show>
      <Show when={hasFoundPharmacies()}>
        <div>Location: {location()?.formatted_address}</div>
      </Show>
    </div>
  );
}
