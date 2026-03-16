import { createEffect, createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { PreferredPharmacy } from '../SelectedPatientProvider/queries';
import LocationSelect from '../LocationSelect';
import Icon from '../../particles/Icon';
import { types } from '@photonhealth/sdk';
import { usePhotonClient } from '../SDKProvider';
import getLocations, { Location } from '../../utils/getLocations';
import Checkbox from '../../particles/Checkbox';
import Spinner from '../../particles/Spinner';
import { useGoogleService } from '../GoogleServiceProvider';
import { GetPharmaciesQuery } from '../../fetch';
import { PharmacyOption, PharmacySearchInput } from './PharmacySearch';
import { useSelectedPatientContext } from '../SelectedPatientProvider';

// Re-export types for backward compatibility
export type {
  GetPreferredPharmaciesResponse,
  GetLastOrderResponse
} from '../SelectedPatientProvider';
export { GetLastOrderQuery } from '../SelectedPatientProvider';

export interface PharmacySearchProps {
  address?: string;
  patientId?: string;
  geocodingApiKey?: string;
  hidePreferred?: boolean;
  setPharmacy: (pharmacy: types.Pharmacy) => void;
  setPreferred?: (shouldSetPreferred: boolean) => void;
  initialValue?: PharmacyOption;
}

export default function PickupPharmacySearch(props: PharmacySearchProps) {
  const client = usePhotonClient();
  const { googleMapsServices } = useGoogleService();
  const selectedPatientContext = useSelectedPatientContext();
  const [selected, setSelected] = createSignal<any>(props.initialValue);
  const [query, setQuery] = createSignal('');
  const [location, setLocation] = createSignal<Location | null>(null);
  const [pharmacies, setPharmacies] = createSignal<PharmacyOption[] | null>(null);
  const [preferredPharmacies, setPreferredPharmacies] = createSignal<PharmacyOption[]>([]);
  const [fetchingPharmacies, setFetchingPharmacies] = createSignal(false);
  const [openLocationSearch, setOpenLocationSearch] = createSignal(false);
  const [previousId, setPreviousId] = createSignal<string | null>(null);
  const [lastGeocodedAddress, setLastGeocodedAddress] = createSignal('');

  async function fetchPharmacies() {
    const { data } = await client!.apollo.query({
      query: GetPharmaciesQuery,
      variables: {
        location: { latitude: location()?.latitude, longitude: location()?.longitude }
      }
    });

    if (data?.pharmacies?.length > 0) {
      setPharmacies(
        data.pharmacies.map((ph: PreferredPharmacy) => ({
          ...ph,
          isPreferred: false
        }))
      );
    }
    setFetchingPharmacies(false);
  }

  const localPreferredPharmacies = createMemo(() => {
    const localPharmacies = pharmacies() || [];
    return preferredPharmacies().filter((preferredPharmacy) =>
      localPharmacies.some((regularPharmacy) => regularPharmacy.id === preferredPharmacy.id)
    );
  });

  const mergedPharmacies = createMemo(() => {
    const localPharmacies = pharmacies() || [];
    const localPreferred = localPreferredPharmacies();
    const previousPharmacyId = previousId();

    const allPharmacies = [...localPreferred, ...localPharmacies];

    const pharmacyLookup = allPharmacies.reduce((acc, cur) => {
      if (!acc[cur.id]) {
        const isPrevious = previousPharmacyId === cur.id;
        acc[cur.id] = { ...cur, isPrevious };
      }
      return acc;
    }, {} as Record<string, PharmacyOption>);
    const dedupedPharmacies = Object.values(pharmacyLookup);

    return dedupedPharmacies;
  });

  createEffect(() => {
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
    const preferredPharmacies = selectedPatientContext.preferredPharmacies();
    if (preferredPharmacies.length > 0) {
      const preferredPharmacyOptions = preferredPharmacies
        .filter((ph) => ph.address)
        .map(toPharmacyOption);
      setPreferredPharmacies(preferredPharmacyOptions);
    }
  });

  createEffect(() => {
    const recent = selectedPatientContext.recentOrder();
    if (recent?.pharmacy?.id) {
      setPreviousId(recent.pharmacy.id);
    }
  });

  createEffect(() => {
    // if address is set later in lifecycle, fetch
    const address = props?.address;
    if (address && address !== lastGeocodedAddress()) {
      setFetchingPharmacies(true);
      const timer = setTimeout(() => {
        setLastGeocodedAddress(address);
        getAndSetLocation(address);
      }, 500);
      onCleanup(() => clearTimeout(timer));
    }
  });

  createEffect(() => {
    // set the default value to be the first preferred pharmacy if it exists
    const noSelection = !selected()?.id;
    const hasPreferredPharmacies = localPreferredPharmacies()?.length > 0;
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
            <Show
              when={!selectedPatientContext.patientPharmacyDataLoading()}
              fallback={<Spinner size="sm" />}
            >
              <a
                href="#!"
                role="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenLocationSearch(true);
                }}
                class="text-left truncate text-blue-600 font-semibold text-sm flex items-center"
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
          !selectedPatientContext.patientPharmacyDataLoading() &&
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

function toPharmacyOption(ph: PreferredPharmacy): PharmacyOption {
  return {
    id: ph.id,
    name: ph.name,
    address: {
      street1: ph.address?.street1 ?? '',
      state: ph.address?.state ?? '',
      city: ph.address?.city ?? ''
    },
    isPreferred: true,
    isPrevious: false
  };
}
