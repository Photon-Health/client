import { For, Show, createEffect, createMemo, createSignal } from 'solid-js';
import { gql } from '@apollo/client';
import { Pharmacy } from '@photonhealth/sdk/dist/types';
import InputGroup from '../../particles/InputGroup';
import ComboBox from '../../particles/ComboBox';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import LocationSelect, { Location } from '../LocationSelect';
import Icon from '../../particles/Icon';
import Button from '../../particles/Button';

import { types } from '@photonhealth/sdk';
import { usePhotonClient } from '../SDKProvider';

const GetPharmaciesQuery = gql`
  query GetPharmacies($location: LatLongSearch!) {
    pharmacies(location: $location) {
      id
      name
      address {
        street1
        city
        state
      }
    }
  }
`;

export interface PharmacyProps {
  address?: string;
  patientId?: string;
  geocodingApiKey?: string;
  setPharmacy: (pharmacy: types.Pharmacy) => void;
}

export default function PharmacySearch(props: PharmacyProps) {
  const client = usePhotonClient();
  const [selected, setSelected] = createSignal<any>();
  const [query, setQuery] = createSignal('');
  const [location, setLocation] = createSignal<Location | null>(null);
  const [pharmacies, setPharmacies] = createSignal<Pharmacy[] | null>(null);
  const [fetching, setFetching] = createSignal(false);
  const [openLocationSearch, setOpenLocationSearch] = createSignal(false);

  async function fetchPharmacies() {
    console.log('client', client);
    const { data } = await client!.apollo.query({
      query: GetPharmaciesQuery,
      variables: {
        location: { latitude: location()?.latitude, longitude: location()?.longitude, radius: 20 }
      }
    });

    if (data?.pharmacies?.length > 0) {
      setPharmacies(data.pharmacies);
    }

    setFetching(false);
  }

  createEffect(() => {
    // If user selects a location, fetch pharmacies
    if (location()?.latitude && location()?.longitude) {
      setPharmacies(null);
      setFetching(true);
      fetchPharmacies();
    }
  });

  const filteredPharmacies = createMemo(() => {
    if (pharmacies() === null || pharmacies()?.length === 0) {
      return [];
    }

    return query() === ''
      ? pharmacies()
      : pharmacies()?.filter((pharmacy) => {
          return pharmacy.name.toLowerCase().includes(query().toLowerCase());
        }) || [];
  });

  createEffect(() => {
    if (selected()?.id) {
      setQuery('');
      props?.setPharmacy?.(selected());
    }
  });

  const formattedAddress = (pharmacy: Pharmacy) =>
    `${capitalizeFirstLetter(pharmacy.address?.street1 || '')}, ${capitalizeFirstLetter(
      pharmacy.address?.city || ''
    )}, ${pharmacy.address?.state}`;

  return (
    <div>
      <LocationSelect
        setLocation={setLocation}
        open={openLocationSearch()}
        setOpen={setOpenLocationSearch}
      />
      <Show when={!pharmacies() && !fetching()}>
        <InputGroup label="Select a location">
          <Button onClick={() => setOpenLocationSearch(true)}>Set Search Location</Button>
        </InputGroup>
      </Show>
      <Show when={pharmacies() || fetching()}>
        <InputGroup
          label="Select a pharmacy"
          helpText={
            <Button
              variant="naked"
              onClick={() => setOpenLocationSearch(true)}
              iconLeft={<Icon name="mapPin" size="sm" />}
            >
              {location()?.address || '...'}{' '}
            </Button>
          }
          loading={fetching()}
        >
          <ComboBox value={pharmacies()?.[0] || undefined} setSelected={setSelected}>
            <ComboBox.Input
              onInput={(e) => setQuery(e.currentTarget.value)}
              displayValue={(pharmacy) =>
                pharmacy?.name ? `${pharmacy.name}, ${formattedAddress(pharmacy)}` : ''
              }
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
