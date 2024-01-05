import { For, Show, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { gql } from '@apollo/client';
import { Pharmacy } from '@photonhealth/sdk/dist/types';
import InputGroup from '../../particles/InputGroup';
import ComboBox from '../../particles/ComboBox';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import LocationSelect from '../LocationSelect';
import Icon from '../../particles/Icon';

import { types } from '@photonhealth/sdk';
import { usePhotonClient } from '../SDKProvider';
import getLocations, { Location } from '../../utils/getLocations';
import loadGoogleScript from '../../utils/loadGoogleScript';
import Badge from '../../particles/Badge';
import Checkbox from '../../particles/Checkbox';
import formatAddress from '../../utils/formatAddress';
import Spinner from '../../particles/Spinner';

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

const GetPreferredPharmaciesQuery = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      address {
        street1
        street2
        city
        state
        postalCode
      }
      preferredPharmacies {
        id
        name
        address {
          street1
          city
          state
        }
      }
    }
  }
`;

const GetLastOrder = gql`
  query GetLastOrder($id: ID!) {
    orders(filter: { patientId: $id }, first: 1) {
      pharmacy {
        id
      }
    }
  }
`;

export interface PharmacySearchProps {
  address?: string;
  patientId?: string;
  geocodingApiKey?: string;
  hidePreferred?: boolean;
  setPharmacy: (pharmacy: types.Pharmacy) => void;
  setPreferred?: (shouldSetPreferred: boolean) => void;
}

interface PharmacyExtended extends Pharmacy {
  preferred: boolean | undefined;
}

export default function PharmacySearch(props: PharmacySearchProps) {
  const client = usePhotonClient();
  const [selected, setSelected] = createSignal<any>();
  const [query, setQuery] = createSignal('');
  const [location, setLocation] = createSignal<Location | null>(null);
  const [pharmacies, setPharmacies] = createSignal<PharmacyExtended[] | null>(null);
  const [preferredPharmacies, setPreferredPharmacies] = createSignal<PharmacyExtended[]>([]);
  const [fetchingPharmacies, setFetchingPharmacies] = createSignal(false);
  const [fetchingPreferred, setFetchingPreferred] = createSignal(false);
  const [openLocationSearch, setOpenLocationSearch] = createSignal(false);
  const [geocoder, setGeocoder] = createSignal<google.maps.Geocoder | undefined>();
  const [previousId, setPreviousId] = createSignal<string | null>(null);

  async function fetchPharmacies() {
    const { data } = await client!.apollo.query({
      query: GetPharmaciesQuery,
      variables: {
        location: { latitude: location()?.latitude, longitude: location()?.longitude, radius: 20 }
      }
    });

    if (data?.pharmacies?.length > 0) {
      setPharmacies(data.pharmacies.map((ph: Pharmacy) => ({ ...ph, preferred: false })));
    }
    setFetchingPharmacies(false);
  }

  async function fetchPreferredAndPrevious(patientId: string) {
    setFetchingPreferred(true);
    const { data: preferredData } = await client!.apollo.query({
      query: GetPreferredPharmaciesQuery,
      variables: { id: patientId }
    });
    const { data: previousData } = await client!.apollo.query({
      query: GetLastOrder,
      variables: { id: patientId }
    });

    const address = preferredData?.patient?.address;

    if (address) {
      const addressStr = formatAddress(address);
      await getAndSetLocation(addressStr, geocoder()!);
    }

    if (preferredData?.patient?.preferredPharmacies?.length > 0) {
      setPreferredPharmacies(
        preferredData?.patient?.preferredPharmacies.map((ph: Pharmacy) => ({
          ...ph,
          preferred: true
        }))
      );
    }

    if (previousData?.orders?.length > 0) {
      setPreviousId(previousData?.orders?.[0]?.pharmacy?.id);
    }
    setFetchingPreferred(false);
  }

  const mergedPharmacies = createMemo(() => {
    const localPharmacies = pharmacies() || [];
    // -- verify preferred pharmacy is included in local pharmacy search
    // e.g. I live in Brooklyn where my preferred pharm is, but if I'm traveling in Texas,
    // I don't want my Brooklyn preferred to show up in the Texas list
    const crossoverPreferredPharmacies = preferredPharmacies().filter((preferredPharmacy) =>
      localPharmacies.some((regularPharmacy) => regularPharmacy.id === preferredPharmacy.id)
    );

    // -- merge preferred and local lists and remove duplicates
    const allPharmacies = [...crossoverPreferredPharmacies, ...localPharmacies];
    const ids = allPharmacies.map((pharmacy) => pharmacy.id);

    // could optimize with Set, but fine for amount of pharms
    return allPharmacies.filter((pharmacy, index) => ids.indexOf(pharmacy.id) === index);
  });

  createEffect(() => {
    // If user selects a location, fetch pharmacies
    if (location()?.latitude && location()?.longitude) {
      setPharmacies(null);
      setFetchingPharmacies(true);
      fetchPharmacies();
    }
  });

  const filteredPharmacies = createMemo(() => {
    if (mergedPharmacies() === null || mergedPharmacies()?.length === 0) {
      return [];
    }

    return query() === ''
      ? mergedPharmacies()
      : mergedPharmacies()?.filter((pharmacy) => {
          return pharmacy.name.toLowerCase().includes(query().toLowerCase());
        }) || [];
  });

  createEffect(() => {
    // if user selects a pharmacy from the drop down, set the pharmacy
    if (selected()?.id) {
      setQuery('');
      props?.setPharmacy?.(selected());
    }
  });

  const formattedAddress = (pharmacy: Pharmacy) =>
    `${capitalizeFirstLetter(pharmacy.address?.street1 || '')}, ${capitalizeFirstLetter(
      pharmacy.address?.city || ''
    )}, ${pharmacy.address?.state}`;

  async function getAndSetLocation(address: string, geocoder: google.maps.Geocoder) {
    const locations = await getLocations(address || '', geocoder);
    setLocation(locations[0]);
  }

  onMount(() => {
    if (props?.address) {
      setFetchingPharmacies(true);
    }

    loadGoogleScript({
      onLoad: async () => {
        const geo = new google.maps.Geocoder();
        setGeocoder(geo);
        if (props?.address) {
          getAndSetLocation(props.address || '', geo);
        }
      }
    });
  });

  createEffect(() => {
    // if patient id, fetch preferred Pharmacies
    if (props?.patientId) {
      fetchPreferredAndPrevious(props?.patientId);
    }
  });

  createEffect(() => {
    // if address is set later in lifecycle, fetch
    if (props?.address) {
      setFetchingPharmacies(true);
      getAndSetLocation(props.address, geocoder()!);
    }
  });

  return (
    <div>
      <LocationSelect
        setLocation={setLocation}
        open={openLocationSearch()}
        setOpen={setOpenLocationSearch}
      />
      <InputGroup
        label={
          <div class="w-full flex flex-col sm:flex-row sm:items-center mb-2">
            <label class="whitespace-nowrap mr-1">Showing near:</label>
            <Show when={!fetchingPreferred()} fallback={<Spinner size="sm" />}>
              <a
                href="#!"
                role="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenLocationSearch(true);
                }}
                class="text-left truncate text-blue-600 font-semibold text-sm"
              >
                <Icon name="mapPin" size="sm" class="inline-block mr-1" />
                {location()?.address || 'Set a location'}
              </a>
            </Show>
          </div>
        }
        helpText={
          <div class="flex gap-x-1">
            <Show when={selected()?.preferred}>
              <Badge size="sm" color="blue">
                Preferred
              </Badge>
            </Show>
            <Show
              when={!!previousId() && previousId() === selected()?.id && !selected()?.preferred}
            >
              <Badge size="sm" color="green">
                Previous
              </Badge>
            </Show>
          </div>
        }
        loading={fetchingPharmacies()}
      >
        <ComboBox
          value={(preferredPharmacies()?.length > 0 && mergedPharmacies()?.[0]) || undefined}
          setSelected={setSelected}
        >
          <ComboBox.Input
            onInput={(e) => setQuery(e.currentTarget.value)}
            displayValue={(pharmacy) => {
              return pharmacy?.name
                ? `${pharmacy.name}, ${capitalizeFirstLetter(pharmacy.address?.street1 || '')}`
                : '';
            }}
          />
          <ComboBox.Options>
            <Show when={(filteredPharmacies()?.length || 0) > 0}>
              <For each={filteredPharmacies()}>
                {(pharmacy) => {
                  return (
                    <ComboBox.Option key={pharmacy.id} value={pharmacy}>
                      <div class="flex gap-x-1 items-center">
                        {pharmacy.name}{' '}
                        <Show when={pharmacy.preferred}>
                          <Badge size="sm" color="blue">
                            Preferred
                          </Badge>
                        </Show>
                        <Show when={previousId() === pharmacy.id && !pharmacy.preferred}>
                          <Badge size="sm" color="green">
                            Previous
                          </Badge>
                        </Show>
                      </div>

                      <div class="text-xs">{formattedAddress(pharmacy)}</div>
                    </ComboBox.Option>
                  );
                }}
              </For>
            </Show>
            <Show when={filteredPharmacies()?.length === 0}>
              <div class="p-4">No pharmacy matches that search</div>
            </Show>
          </ComboBox.Options>
        </ComboBox>
      </InputGroup>
      <Show
        when={
          !props?.hidePreferred &&
          !fetchingPharmacies() &&
          !fetchingPreferred() &&
          !!selected() &&
          !selected()?.preferred
        }
      >
        <Checkbox
          id="set-preferred-pharmacy"
          mainText="Set as preferred pharmacy"
          checked={false}
          onChange={(isChecked) => props?.setPreferred?.(isChecked)}
        />
      </Show>
    </div>
  );
}
