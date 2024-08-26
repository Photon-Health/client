// Solid
import { customElement } from 'solid-element';
import { createMemo, createSignal, onMount } from 'solid-js';

// Photon
import { usePhoton } from '../context';
import { PhotonDropdown } from '../photon-dropdown';

// Types
import { Medication, Treatment, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import { CatalogStore } from '../stores/catalog';

// Utility Functions

function triggerCustomEvent(ref: any, eventName: string, detail: any) {
  const event = new CustomEvent(eventName, {
    composed: true,
    bubbles: true,
    detail
  });
  ref?.dispatchEvent(event);
}

function dispatchTreatmentSelected(
  ref: any,
  datum: Treatment | PrescriptionTemplate,
  catalogId: string
) {
  triggerCustomEvent(ref, 'photon-treatment-selected', { data: datum, catalogId });
}

function getFilteredData(
  props: ComponentProps,
  filter: string
): (Treatment | PrescriptionTemplate)[] {
  const { store } = CatalogStore;

  if (store.catalogs.data.length === 0) return [];

  const catalogData = [
    ...(props.offCatalogOption ? [props.offCatalogOption as Treatment] : []),
    ...store.catalogs.data[0].templates.map((x) => x as PrescriptionTemplate),
    ...store.catalogs.data[0].treatments.map((x) => x as Treatment)
  ];

  const filterValue = filter.toLowerCase();
  if (filterValue.length === 0) return catalogData;

  return catalogData.filter((x) => {
    if ('treatment' in x) {
      return (
        x.treatment.name.toLowerCase().includes(filterValue) ||
        x.name?.toLowerCase().includes(filterValue)
      );
    }
    return x.name.toLowerCase().includes(filterValue);
  });
}

function displayTreatment(t: Treatment, groupAccess: boolean) {
  return groupAccess ? (
    <p class="text-sm whitespace-normal leading-snug my-1">{t.name}</p>
  ) : (
    t.name || ''
  );
}

function displayPrescriptionTemplate(t: PrescriptionTemplate, groupAccess: boolean) {
  return groupAccess ? (
    <div class="my-1">
      <div class="text-sm whitespace-normal leading-snug">
        {t.name ? <span class="font-bold">{t.name}: </span> : ''}
        {t.treatment.name}
      </div>
      <p class="text-xs text-gray-500 overflow-hidden whitespace-nowrap overflow-ellipsis">
        QTY: {t.dispenseQuantity} {t.dispenseUnit} | Days Supply: {t.daysSupply} | Refills:{' '}
        {t.fillsAllowed ? t.fillsAllowed - 1 : 0} | Sig: {t.instructions}
      </p>
    </div>
  ) : (
    t.treatment.name
  );
}

function getGroupsConfig(props: ComponentProps) {
  return [
    {
      // TODO: Double-check with Jomi on the naming of this section
      label: 'OFF CATALOG',
      filter: (t: any) =>
        t && typeof t === 'object' && props.offCatalogOption && t.id === props.offCatalogOption.id
    },
    {
      label: 'PERSONAL TEMPLATES',
      filter: (t: any) => t && typeof t === 'object' && 'treatment' in t && t.isPrivate
    },
    {
      label: 'ORGANIZATION TEMPLATES',
      filter: (t: any) => t && typeof t === 'object' && 'treatment' in t && !t.isPrivate
    },
    {
      label: 'ORGANIZATION CATALOG',
      filter: (t: any) => t && typeof t === 'object' && 'name' in t && !('treatment' in t)
    },
    {
      label: 'ALL TREATMENTS',
      filter: (t: any) =>
        t && typeof t === 'object' && props.offCatalogOption && t.id === props.offCatalogOption.id
    }
  ];
}

// Component Definition

interface ComponentProps {
  label?: string;
  required: boolean;
  invalid: boolean;
  helpText?: string;
  catalogId?: string;
  disabled: boolean;
  formName?: string;
  selected?: Treatment;
  offCatalogOption?: Medication;
}

const Component = (props: ComponentProps) => {
  let ref: any;
  const client = usePhoton();
  const { store, actions } = CatalogStore;
  const [filter, setFilter] = createSignal<string>('');

  onMount(async () => {
    await actions.getCatalogs(client!.getSDK());
    // await actions.getTreatmentOptions(client!.getSDK());
  });

  const data = createMemo(() => getFilteredData(props, filter()));

  const displayAccessor = (t: Treatment | PrescriptionTemplate, groupAccess: boolean) => {
    if (t?.__typename !== 'PrescriptionTemplate') {
      return displayTreatment(t as Treatment, groupAccess);
    } else {
      return displayPrescriptionTemplate(t as PrescriptionTemplate, groupAccess);
    }
  };

  return (
    <div
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchTreatmentSelected(ref, e.detail.data, store.catalogs.data![0]?.id || '');
      }}
    >
      <PhotonDropdown
        data={data()}
        groups={getGroupsConfig(props)}
        label={props.label}
        disabled={props.disabled}
        required={props.required}
        placeholder="Type medication"
        invalid={props.invalid}
        isLoading={store.catalogs.isLoading}
        hasMore={false}
        selectedData={props.selected ?? (props.offCatalogOption as Treatment)}
        displayAccessor={displayAccessor}
        onSearchChange={(s: string) => setFilter(s)}
        onHide={() => setFilter('')}
        helpText={props.helpText}
      />
    </div>
  );
};

// Custom Element Registration

customElement(
  'photon-medication-search',
  {
    label: undefined,
    required: false,
    invalid: false,
    helpText: undefined,
    catalogId: undefined,
    disabled: false,
    formName: undefined,
    selected: undefined,
    offCatalogOption: undefined
  },
  Component
);
