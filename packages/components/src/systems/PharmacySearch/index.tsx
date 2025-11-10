import { Show, createEffect, createMemo, createSignal } from 'solid-js';
import { gql } from '@apollo/client';
import { Address, Pharmacy as _Pharmacy } from '@photonhealth/sdk/dist/types';
import LocationSelect from '../LocationSelect';
import Icon from '../../particles/Icon';
import { types } from '@photonhealth/sdk';
import { usePhotonClient } from '../SDKProvider';
import getLocations, { Location } from '../../utils/getLocations';
import Checkbox from '../../particles/Checkbox';
import formatAddress from '../../utils/formatAddress';
import Spinner from '../../particles/Spinner';
import { useGoogleService } from '../GoogleServiceProvider';
import { GetPatientPreferredPharmaciesAndAddress, GetPharmaciesQuery } from '../../fetch';
import { PharmacyOption, PharmacySearchInput } from './PharmacySearch';

type Pharmacy = Pick<_Pharmacy, 'id' | 'name'> & {
  address: Pick<Address, 'street1' | 'city' | 'state'>;
};

export interface GetPreferredPharmaciesResponse {
  patient: {
    address: Address;
    preferredPharmacies: Pharmacy[];
  };
}

export const GetLastOrderQuery = gql`
  query GetLastOrder($id: ID!) {
    orders(filter: { patientId: $id }, first: 1) {
      createdAt
      pharmacy {
        id
        name
        address {
          street1
          street2
          city
          state
          postalCode
        }
      }
    }
  }
`;

type PharmacyOrder = {
  id: string;
  name: string;
  address: Address;
};

export interface GetLastOrderResponse {
  orders: {
    createdAt: string;
    pharmacy: PharmacyOrder;
  }[];
}

export interface PharmacySearchProps {
  address?: string;
  patientId?: string;
  geocodingApiKey?: string;
  hidePreferred?: boolean;
  setPharmacy: (pharmacy: types.Pharmacy) => void;
  setPreferred?: (shouldSetPreferred: boolean) => void;
}

export default function PickupPharmacySearch(props: PharmacySearchProps) {
  const client = usePhotonClient();
  const { googleMapsServices } = useGoogleService();
  const [selected, setSelected] = createSignal<any>();
  const [query, setQuery] = createSignal('');
  const [location, setLocation] = createSignal<Location | null>(null);
  const [pharmacies, setPharmacies] = createSignal<PharmacyOption[] | null>(null);
  const [preferredPharmacies, setPreferredPharmacies] = createSignal<PharmacyOption[]>([]);
  const [fetchingPharmacies, setFetchingPharmacies] = createSignal(false);
  const [fetchingPreferred, setFetchingPreferred] = createSignal(false);
  const [openLocationSearch, setOpenLocationSearch] = createSignal(false);
  const [previousId, setPreviousId] = createSignal<string | null>(null);

  async function fetchPharmacies() {
    const { data } = await client!.apollo.query({
      query: GetPharmaciesQuery,
      variables: {
        location: { latitude: location()?.latitude, longitude: location()?.longitude }
      }
    });

    if (data?.pharmacies?.length > 0) {
      setPharmacies(data.pharmacies.map((ph: Pharmacy) => ({ ...ph, isPreferred: false })));
    }
    setFetchingPharmacies(false);
  }

  async function fetchPreferredAndPrevious(patientId: string) {
    setFetchingPreferred(true);
    try {
      const { data: preferredData } = await client!.apollo.query({
        query: GetPatientPreferredPharmaciesAndAddress,
        variables: { id: patientId }
      });
      const { data: previousData } = await client!.apollo.query({
        query: GetLastOrderQuery,
        variables: { id: patientId }
      });

      const address = preferredData?.patient?.address;

      if (address) {
        const addressStr = formatAddress(address);
        await getAndSetLocation(addressStr);
      }

      if (preferredData?.patient?.preferredPharmacies?.length > 0) {
        setPreferredPharmacies(
          preferredData?.patient?.preferredPharmacies.map((ph: Pharmacy) => ({
            ...ph,
            isPreferred: true
          }))
        );
      }

      if (previousData?.orders?.length > 0) {
        setPreviousId(previousData?.orders?.[0]?.pharmacy?.id);
      }
    } catch (error) {
      console.error('Error fetching preferred and previous pharmacies:', error);
    } finally {
      setFetchingPreferred(false);
    }
  }

  const mergedPharmacies = createMemo(() => {
    const localPharmacies = pharmacies() || [];
    // -- verify preferred pharmacy is included in local pharmacy search
    // e.g. I live in Brooklyn where my preferred pharm is, but if I'm traveling in Texas,
    // I don't want my Brooklyn preferred to show up in the Texas list
    const crossoverPreferredPharmacies = preferredPharmacies().filter((preferredPharmacy) =>
      localPharmacies.some((regularPharmacy) => regularPharmacy.id === preferredPharmacy.id)
    );

    const previousPharmacyId = previousId();

    // -- merge preferred and local lists and remove duplicates
    const allPharmacies = [...crossoverPreferredPharmacies, ...localPharmacies];

    // dedupe pharmacies in favor of preferred pharmacy if there's a duplicate in local pharmacies
    const pharmacyLookup = allPharmacies.reduce((acc, cur) => {
      if (!acc[cur.id]) {
        // while we're scanning, if we have a matching previous id here, mark it as so
        const isPrevious = previousPharmacyId === cur.id;
        acc[cur.id] = { ...cur, isPrevious };
      }
      return acc;
    }, {} as Record<string, PharmacyOption>);
    const dedupedPharmacies = Object.values(pharmacyLookup);

    return dedupedPharmacies;
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

  async function getAndSetLocation(address: string) {
    const { geocoder } = googleMapsServices();
    if (!geocoder) throw new Error('Geocoder not loaded');

    const locations = await getLocations(address || '', geocoder);
    if (locations.length > 0) {
      setLocation(locations[0]);
    }
  }

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
      getAndSetLocation(props.address);
    }
  });

  createEffect(() => {
    // set the default value to be the first preferred pharmacy if it exists
    const noSelection = !selected()?.id;
    const hasPreferredPharmacies = preferredPharmacies()?.length > 0;
    const defaultPharmacy = mergedPharmacies()?.[0];
    if (noSelection && hasPreferredPharmacies && defaultPharmacy) {
      setSelected(defaultPharmacy);
    }
  });

  return (
    <div>
      <LocationSelect
        setLocation={setLocation}
        open={openLocationSearch()}
        setOpen={setOpenLocationSearch}
      />
      <PharmacySearchInput
        value={selected()?.id ? selected() : undefined}
        setValue={setSelected}
        options={filteredPharmacies()}
        onSearch={setQuery}
        loading={fetchingPharmacies()}
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
      />
      <Show
        when={
          !props?.hidePreferred &&
          !fetchingPharmacies() &&
          !fetchingPreferred() &&
          !!selected() &&
          !selected()?.isPreferred
        }
      >
        <div class="mt-4">
          <Checkbox
            id="set-preferred-pharmacy"
            mainText="Set as preferred pharmacy"
            checked={false}
            onChange={(isChecked) => props?.setPreferred?.(isChecked)}
          />
        </div>
      </Show>
    </div>
  );
}
