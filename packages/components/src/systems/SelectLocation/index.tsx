import { createSignal } from 'solid-js';
import { Icon } from 'solid-heroicons';
import { mapPin } from 'solid-heroicons/solid';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import InputGroup from '../../particles/InputGroup';
import Input from '../../particles/Input';
import Spinner from '../../particles/Spinner';

export default function SelectLocation() {
  const [open, setOpen] = createSignal(false);
  const [address, setAddress] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleAddressSubmit = (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1000);
  };

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
            iconLeft={
              loading() ? (
                <Spinner size="sm" />
              ) : (
                <Icon path={mapPin} class="h-4 w-4" aria-hidden="true" />
              )
            }
          >
            Use my Current Location
          </Button>
        </div>
        <div class="flex items-center gap-2 py-2">
          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700 w-full" />
          <p>OR</p>
          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700 w-full" />
        </div>
        <form onSubmit={handleAddressSubmit}>
          <InputGroup label="Enter an address or zip code" loading={loading()}>
            <Input type="text" value={address()} onInput={(e) => setAddress(e.target?.value)} />
          </InputGroup>
        </form>
      </Dialog>
    </div>
  );
}
