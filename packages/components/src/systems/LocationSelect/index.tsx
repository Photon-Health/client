import { createSignal, onMount } from 'solid-js';
import Icon from '../../particles/Icon';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import InputGroup from '../../particles/InputGroup';
import Input from '../../particles/Input';
import Spinner from '../../particles/Spinner';
import getNavigatorLocation from '../../utils/getNavigatorLocation';
import loadGoogleScript from '../../utils/loadGoogleScript';
import getLocation, { Location } from '../../utils/getLocation';

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
  let geocoder: google.maps.Geocoder | undefined;

  onMount(async () => {
    loadGoogleScript({
      onLoad: async () => {
        geocoder = new google.maps.Geocoder();
      }
    });
  });

  const handleAddressSubmit = async (e: Event) => {
    // get location with address
    e.preventDefault();
    setLoadingSearch(true);
    setNavigatorError(false);
    const location = await getLocation(address(), geocoder!);
    props.setLocation(location);
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
      const location = await getLocation({ latitude, longitude }, geocoder!);
      props.setLocation(location);
      props.setOpen(false);
    } catch {
      setNavigatorError(true);
    }
    setLoadingNavigator(false);
  };

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
          <Input type="text" value={address()} onInput={(e) => setAddress(e.currentTarget.value)} />
        </InputGroup>
      </form>
    </Dialog>
  );
}
