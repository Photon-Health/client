import { Pharmacy } from '@photonhealth/sdk/dist/types';
import { createEffect, createMemo, createSignal, onMount, Show, untrack } from 'solid-js';
import { usePhoton } from '../../context';
import Button from '../../particles/Button';
import Input from '../../particles/Input';
import { PharmacyStore } from '../../stores/pharmacy';

type PharmacySearchProps = {
  label?: string;
  required?: boolean;
  invalid?: boolean;
  helpText?: string;
  selected?: string;
  formName?: string;
  disabled: boolean;
  address?: string;
  forceLabelSize?: boolean;
  patientId?: string;
  geocodingApiKey?: string;
  uP?: any;
};

export default function PharmacySearch(props: PharmacySearchProps) {
  let ref: any;

  // Used to manage reactivity issues when exporting to the Elements Package
  const client = props.uP ? props.uP() : usePhoton();

  const [trigger, setTrigger] = createSignal(false);

  let geocoder: google.maps.Geocoder | undefined;
  const { store, actions } = PharmacyStore;
  const [userOverrode, setUserOverrode] = createSignal<boolean>(false);
  const [address, setAddress] = createSignal<string>('');
  const [selected, setSelected] = createSignal<string>('');
  const [filter, setFilter] = createSignal<string>('');

  const dispatchSelected = (pharmacy: Pharmacy) => {
    const event = new CustomEvent('photon-pharmacy-selected', {
      composed: true,
      bubbles: true,
      detail: {
        pharmacy
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchRemoved = () => {
    const event = new CustomEvent('photon-pharmacy-removed', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  const getData = createMemo(() => {
    const filteredPharmacies = store.pharmacies.data
      .filter((x) => !(store.preferredPharmacies.data ?? []).map((y) => y.id).includes(x.id))
      .filter((x) => x.name.toLowerCase().includes(filter().toLowerCase()));

    if (store.selectedPharmacy.data && selected()) {
      return [
        store.selectedPharmacy.data,
        ...(store.preferredPharmacies.data ?? []).filter(
          (z) => z.id != store.selectedPharmacy.data?.id
        ),
        ...filteredPharmacies
      ];
    } else {
      return [...(store.preferredPharmacies.data ?? []), ...filteredPharmacies];
    }
  });

  onMount(async () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${props.geocodingApiKey}`;
    document.head.appendChild(script);
    script.onload = async () => {
      geocoder = new google.maps.Geocoder();
      setAddress(props.address);
      setSelected(props.selected);
      if (props.patientId) {
        await actions.getPreferredPharmacies(client!.getSDK(), props.patientId);
      }
      if (props.address) {
        await actions.getPharmaciesByAddress(client!.getSDK(), geocoder!, String(props.address));
      }
      if (props.selected) {
        await actions.getPharmacy(client!.getSDK(), props.selected!);
      }
      if (!props.address && !props.selected) {
        setUserOverrode(true);
      }
    };
    script.onerror = (err) => {
      console.error('Error loading Google Maps Geocoding API: ', err);
    };
  });

  createEffect(() => {
    setAddress(props.address);
    setSelected(props.selected);
    if (!props.selected && !props.address) {
      setUserOverrode(true);
    } else {
      setUserOverrode(false);
    }
    if (props.selected) {
      untrack(async () => {
        await actions.getPharmacy(client!.getSDK(), props.selected!);
      });
    }
    if (props.address && !props.selected) {
      untrack(async () => {
        actions.clearSelectedPharmacy();
        await actions.getPharmaciesByAddress(client!.getSDK(), geocoder!, props.address);
      });
    }
  });

  return (
    <div
      class="flex flex-col gap-2"
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchSelected(e.detail.data);
      }}
    >
      <Button onClick={() => console.log('HY')}>Hello</Button>
      <Show when={address() && !userOverrode() && (store.pharmacies.errors || []).length == 0}>
        <div class="flex flex-row gap-4 items-start">
          <div class="flex flex-col font-sans text-sm">
            <p class=" text-gray-500">Showing pharmacies near</p>
            <p>{store.pharmacies.address}</p>
          </div>
          <Button
            size="xs"
            onClick={() => {
              setUserOverrode(true);
            }}
          >
            Change
          </Button>
        </div>
      </Show>
      <Show
        when={
          selected() && !address() && !userOverrode() && (store.pharmacies.errors || []).length == 0
        }
      >
        <div class="flex flex-row gap-4 items-center">
          <div class="flex flex-col font-sans text-sm">
            <p class=" text-gray-500">Showing preferred pharmacy</p>
          </div>
          <Button
            size="xs"
            onClick={() => {
              dispatchRemoved();
              setUserOverrode(true);
            }}
          >
            Change
          </Button>
        </div>
      </Show>
      <Show
        when={
          userOverrode() ||
          (store.pharmacies.errors || []).filter(
            (x) => x.message.includes('seems invalid') || x.message.includes('unexpected error')
          ).length > 0
        }
      >
        <Input
          error={
            (store.pharmacies.errors || []).length > 0
              ? store.pharmacies.errors[0].message
              : props.helpText
          }
          label="Enter an address or zip code"
        />
        <photon-text-input
          debounce-time="800"
          invalid={props.invalid || (store.pharmacies.errors || []).length > 0}
          help-text={
            (store.pharmacies.errors || []).length > 0
              ? store.pharmacies.errors[0].message
              : props.helpText
          }
          label="Enter an address or zip code"
          on:photon-input-changed={async (e: any) => {
            await actions.getPharmaciesByAddress(client!.getSDK(), geocoder!, e.detail.input);
            setAddress(e.detail.input);
            setSelected('');
            actions.clearSelectedPharmacy();
            setUserOverrode(false);
          }}
        ></photon-text-input>
      </Show>
    </div>
  );
}
