/// <reference types="@types/google.maps" />

//Solid
import { customElement } from 'solid-element';

//Photon
import { usePhoton } from '../context';
import { PhotonDropdown } from '../photon-dropdown';

//Types
import { Pharmacy } from '@photonhealth/sdk/dist/types';
import { createEffect, createMemo, createSignal, onMount, Show, untrack } from 'solid-js';
import { PharmacyStore } from '../stores/pharmacy';
import { toTitleCase } from '../utils';

customElement(
  'photon-pharmacy-search',
  {
    label: undefined,
    required: false,
    invalid: false,
    helpText: undefined,
    selected: '',
    formName: undefined,
    disabled: false,
    forceLabelSize: false,
    address: '',
    patientId: undefined,
    geocodingApiKey: 'AIzaSyAvuwwE6g2Bsmih66nu4dB7-H7U1_7KQ6g'
  },
  (props: {
    label?: string;
    required: boolean;
    invalid: boolean;
    helpText?: string;
    selected: string;
    formName?: string;
    disabled: boolean;
    address: string;
    forceLabelSize: boolean;
    patientId?: string;
    geocodingApiKey?: string;
  }) => {
    let ref: any;
    //context
    const client = usePhoton();

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
        <Show when={address() && !userOverrode() && (store.pharmacies.errors || []).length == 0}>
          <div class="flex flex-row gap-4 items-start">
            <div class="flex flex-col font-sans text-sm">
              <p class=" text-gray-500">Showing pharmacies near</p>
              <p>{store.pharmacies.address}</p>
            </div>
            <photon-button
              class="self-end"
              variant="outline"
              size="xs"
              on:photon-clicked={() => {
                setUserOverrode(true);
              }}
            >
              Change
            </photon-button>
          </div>
        </Show>
        <Show
          when={
            selected() &&
            !address() &&
            !userOverrode() &&
            (store.pharmacies.errors || []).length == 0
          }
        >
          <div class="flex flex-row gap-4 items-center">
            <div class="flex flex-col font-sans text-sm">
              <p class=" text-gray-500">Showing preferred pharmacy</p>
            </div>
            <photon-button
              variant="outline"
              size="xs"
              on:photon-clicked={() => {
                dispatchRemoved();
                setUserOverrode(true);
              }}
            >
              Change
            </photon-button>
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
        <Show
          when={
            (address() || selected()) &&
            !userOverrode() &&
            (store.pharmacies.errors || []).filter(
              (x) => x.message.includes('seems invalid') || x.message.includes('unexpected error')
            ).length == 0
          }
        >
          <PhotonDropdown
            data={getData()}
            groups={[
              ...(filter() === ''
                ? [
                    {
                      label: 'Preferred Pharmacy',
                      filter: (y: Pharmacy) => {
                        if (!y) {
                          return false;
                        }
                        return (store.preferredPharmacies.data ?? [])
                          .map((x) => x.id)
                          .includes(y.id);
                      }
                    }
                  ]
                : []),
              {
                label: 'Pharmacies',
                filter: (x: Pharmacy) => {
                  if (!x) {
                    return false;
                  }
                  return !(store.preferredPharmacies.data ?? []).map((x) => x.id).includes(x.id);
                }
              }
            ]}
            label={props.label}
            forceLabelSize={props.forceLabelSize}
            required={props.required}
            disabled={props.disabled}
            placeholder="Select a pharmacy..."
            invalid={props.invalid || (store.pharmacies.errors || []).length > 0}
            isLoading={store.pharmacies.isLoading || store.selectedPharmacy.isLoading}
            hasMore={false}
            displayAccessor={(p) =>
              `${p.name}, ${toTitleCase(p.address?.street1 || '')}, ${toTitleCase(
                p.address?.city || ''
              )}, ${p.address?.state || ''}`
            }
            showOverflow={true}
            onSearchChange={async (s: string) => {
              setFilter(s);
            }}
            onOpen={async () => {
              if (store.pharmacies.data.length == 0) {
                if (address() && geocoder) {
                  await actions.getPharmaciesByAddress(client!.getSDK(), geocoder, address());
                }
              }
            }}
            noDataMsg={'No pharmacies found'}
            helpText={
              (store.pharmacies.errors || []).length > 0
                ? store.pharmacies.errors[0].message
                : props.helpText
            }
            selectedData={
              selected()
                ? store.selectedPharmacy.data
                : props.patientId
                ? store.preferredPharmacies.data?.[0]
                : undefined
            }
          ></PhotonDropdown>
        </Show>
      </div>
    );
  }
);
