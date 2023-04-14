import { createEffect, createSignal, onMount } from 'solid-js';
import Icon from '../../particles/Icon';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import InputGroup from '../../particles/InputGroup';
import Input from '../../particles/Input';
import Spinner from '../../particles/Spinner';
import getNavigatorLocation from '../../utils/getNavigatorLocation';
import loadGoogleScript from '../../utils/loadGoogleScript';
import { PharmacyStore } from '../../stores/pharmacy';
import { usePhoton } from '../../context';

export default function LocationSelect() {
  const client = usePhoton();
  const [open, setOpen] = createSignal(false);
  const [address, setAddress] = createSignal('');
  const { store, actions } = PharmacyStore;
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
    e.preventDefault();
    setLoadingSearch(true);
    setNavigatorError(false);
    await actions.getPharmaciesByAddress(client!.getSDK(), geocoder!, String(address()));
    setLoadingSearch(false);
  };

  const getCurrentLocation = async () => {
    setLoadingNavigator(true);
    setNavigatorError(false);
    try {
      const {
        coords: { latitude, longitude }
      } = await getNavigatorLocation({ timeout: 5000 });

      await actions.getPharmaciesByAddress(client!.getSDK(), geocoder!, {
        lat: latitude,
        lng: longitude
      });
    } catch {
      setNavigatorError(true);
    }
    setLoadingNavigator(false);
  };

  createEffect(() => {
    if (store.pharmacies.data.length > 0) {
      setOpen(false);
    }
  });

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Set Search Location</Button>
      <Dialog open={open()} onClose={() => setOpen(false)}>
        <div class="mt-3 text-center sm:mt-5">
          <h2>Set Location</h2>
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
          <InputGroup
            label="Enter an address or zip code"
            loading={loadingSearch()}
            error={
              (store.pharmacies.errors || []).length > 0 && !loadingSearch()
                ? store.pharmacies.errors[0].message
                : ''
            }
          >
            <Input type="text" value={address()} onInput={(e) => setAddress(e.target?.value)} />
          </InputGroup>
        </form>
      </Dialog>
    </div>
  );
}
