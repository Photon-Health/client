import { createSignal, onMount, createEffect, For } from 'solid-js';
import Icon from '../../particles/Icon';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import InputGroup from '../../particles/InputGroup';
import Input from '../../particles/Input';
import Spinner from '../../particles/Spinner';
import getNavigatorLocation from '../../utils/getNavigatorLocation';
import loadGoogleScript from '../../utils/loadGoogleScript';
import getLocations, { Location } from '../../utils/getLocations';
import autocompleteLocation from '../../utils/autocompleteLocation';
import ComboBox from '../../particles/ComboBox';

interface LocationSelectProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setLocation: (location: Location) => void;
}

export default function LocationSelect(props: LocationSelectProps) {
  const [address, setAddress] = createSignal('');
  const [loadingNavigator, setLoadingNavigator] = createSignal(false);
  const [loadingSearch, setLoadingSearch] = createSignal(false);
  const [navigatorError, setNavigatorError] = createSignal(false);
  const [options, setOptions] = createSignal<any[]>([]);
  let geocoder: google.maps.Geocoder | undefined;
  let autocompleteService: google.maps.places.AutocompleteService | undefined;

  onMount(async () => {
    loadGoogleScript({
      onLoad: async () => {
        geocoder = new google.maps.Geocoder();
        autocompleteService = new google.maps.places.AutocompleteService();
      }
    });
  });

  const handleAddressSubmit = async (e: Event) => {
    // get location with address
    e.preventDefault();
    setLoadingSearch(true);
    setNavigatorError(false);
    const locations = await getLocations(address(), geocoder!);
    props.setLocation(locations[0]);
    setLoadingSearch(false);
    props.setOpen(false);
  };

  const getCurrentLocation = async () => {
    // get current location with lat/long
    setLoadingNavigator(true);
    setNavigatorError(false);
    try {
      const {
        coords: { latitude, longitude }
      } = await getNavigatorLocation({ timeout: 5000 });
      const locations = await getLocations({ latitude, longitude }, geocoder!);
      props.setLocation(locations[0]);
      props.setOpen(false);
    } catch {
      setNavigatorError(true);
    }
    setLoadingNavigator(false);
  };

  const fetchOptions = async () => {
    const results = await autocompleteLocation(address(), autocompleteService!);
    setOptions(results);
  };

  createEffect(() => {
    if (address()) {
      fetchOptions();
    }
  });

  return (
    <Dialog open={props.open} onClose={() => props.setOpen(false)}>
      <div class="text-left">
        <h3 class="mt-0">Set Location</h3>
        <div class="mt-2">
          <p class="text-sm text-gray-500">
            Enter the zipcode or address where you'd like to search for a pharmacy.
          </p>
        </div>
      </div>
      <div class="mt-5 sm:mt-6 grid grid-cols-1">
        <Button
          variant="tertiary"
          onClick={getCurrentLocation}
          iconLeft={loadingNavigator() ? <Spinner size="sm" /> : <Icon name="mapPin" size="sm" />}
        >
          {loadingNavigator() ? 'Getting Current Location' : 'Use my Current Location'}
        </Button>
        {navigatorError() && (
          <p class="text-sm text-red-500 mt-2 text-center">Could not get current location</p>
        )}
      </div>
      <div class="flex items-center gap-2 py-2">
        <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700 w-full" />
        <p>OR</p>
        <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700 w-full" />
      </div>
      <form onSubmit={handleAddressSubmit}>
        <InputGroup label="Enter an address or zip code" loading={loadingSearch()}>
          <ComboBox>
            <ComboBox.Input
              displayValue={(option) => option.label}
              onInput={(e) => setAddress(e.currentTarget.value)}
            />
            <ComboBox.Options>
              <For each={options()}>
                {(option) => (
                  <ComboBox.Option key={option.value} value={option.label}>
                    {option.label}
                  </ComboBox.Option>
                )}
              </For>
            </ComboBox.Options>
          </ComboBox>
        </InputGroup>
      </form>
    </Dialog>
  );
}
