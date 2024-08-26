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
  searchText: string
): (Treatment | PrescriptionTemplate)[] {
  const { store } = CatalogStore;

  if (store.catalogs.data.length === 0) return [];

  const catalogData = [
    ...(props.offCatalogOption ? [props.offCatalogOption as Treatment] : []),
    ...store.catalogs.data[0].templates.map((x) => x as PrescriptionTemplate),
    ...store.catalogs.data[0].treatments.map((x) => x as Treatment)
  ];

  const searchTextLowerCase = searchText.toLowerCase();
  if (searchTextLowerCase.length === 0) return catalogData;

  return catalogData.filter((x) => {
    if ('treatment' in x) {
      return (
        x.treatment.name.toLowerCase().includes(searchTextLowerCase) ||
        x.name?.toLowerCase().includes(searchTextLowerCase)
      );
    }
    return x.name.toLowerCase().includes(searchTextLowerCase);
  });
}

export const boldSubstring = (inputString: string, substring: any) => {
  // Split the substring into parts
  const substrings = substring.split(' ').filter((part: string) => part.length > 0);

  // Create a regular expression to match any of the substrings
  const regex = new RegExp(`(${substrings.join('|')})`, 'gi');

  // Split the inputString using the regex and map the parts
  const parts = inputString.split(regex);
  return parts.map((part) => {
    if (substrings.some((sub: string) => sub.toLowerCase() === part.toLowerCase())) {
      return <strong class="font-bold">{part}</strong>;
    } else {
      return part;
    }
  });
};

function displayTreatment(t: Treatment, groupAccess: boolean, searchText: string) {
  const boldedName = boldSubstring(t.name, searchText);
  return groupAccess ? (
    <p class="text-sm whitespace-normal leading-snug my-1">{boldedName}</p>
  ) : (
    boldedName || ''
  );
}

function displayPrescriptionTemplate(
  t: PrescriptionTemplate,
  groupAccess: boolean,
  searchText: string
) {
  return groupAccess ? (
    <div class="my-1">
      <div class="text-sm whitespace-normal leading-snug">
        {t.name ? <span class="text-blue-600">({boldSubstring(t.name, searchText)}): </span> : ''}
        {boldSubstring(t.treatment.name, searchText)}
      </div>
      <p class="text-xs text-gray-500 overflow-hidden whitespace-nowrap overflow-ellipsis">
        QTY: {t.dispenseQuantity} {t.dispenseUnit} | Days Supply: {t.daysSupply} | Refills:{' '}
        {t.fillsAllowed ? t.fillsAllowed - 1 : 0} | Sig: {t.instructions}
      </p>
    </div>
  ) : (
    boldSubstring(t.treatment.name, searchText)
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
        // TODO: What is the filter for this group?
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
  const [searchText, setSearchText] = createSignal<string>('');

  onMount(async () => {
    await actions.getCatalogs(client!.getSDK());
  });

  const data = createMemo(() => getFilteredData(props, searchText()));

  const displayAccessor = (t: Treatment | PrescriptionTemplate, groupAccess: boolean) => {
    if (t?.__typename !== 'PrescriptionTemplate') {
      return displayTreatment(t as Treatment, groupAccess, searchText());
    } else {
      return displayPrescriptionTemplate(t as PrescriptionTemplate, groupAccess, searchText());
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
        onSearchChange={(s: string) => setSearchText(s)}
        onHide={() => setSearchText('')}
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
