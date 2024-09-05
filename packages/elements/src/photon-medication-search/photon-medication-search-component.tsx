// Solid
import { customElement } from 'solid-element';
import { createEffect, createSignal, onMount, Show } from 'solid-js';
import { debounce } from '@solid-primitives/scheduled';

// Photon
import { usePhoton } from '../context';
import { PhotonMedicationDropdownFullWidth } from '../photon-medication-dropdown-full-width';
import { PhotonMedicationDropdown } from '../photon-medication-dropdown';
import { PhotonDropdown } from '../photon-dropdown';

// Types
import {
  Medication,
  Treatment,
  PrescriptionTemplate,
  TreatmentOption
} from '@photonhealth/sdk/dist/types';
import { CatalogStore } from '../stores/catalog';

import { ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';

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

type DataReturn<Type> = {
  data?: Type;
  loading?: boolean;
  error?: any;
  errors?: readonly any[];
};

const SearchTreatmentOptionsQuery = gql`
  query SearchTreatmentOptions($searchTerm: String!) {
    treatmentOptions(searchTerm: $searchTerm) {
      id: medicationId
      form
      name
      ndc
      route
      strength
      type
      __typename
    }
  }
`;

const searchTreatmentOptions = async (
  client: ApolloClient<any>,
  searchTerm: string
): Promise<DataReturn<{ treatmentOptions: TreatmentOption[] }>> => {
  return await client.query<{ treatmentOptions: TreatmentOption[] }>({
    query: SearchTreatmentOptionsQuery,
    variables: { searchTerm },
    fetchPolicy: 'no-cache'
  });
};

async function loadTreatmentOptions(
  client: ApolloClient<any>,
  searchText: string
): Promise<TreatmentOption[]> {
  const req = await searchTreatmentOptions(client, searchText);
  return req?.data?.treatmentOptions ?? [];
}

function getFilteredData(
  props: ComponentProps,
  searchText: string,
  treatmentOptions: TreatmentOption[]
): (Treatment | PrescriptionTemplate | TreatmentOption)[] {
  const { store } = CatalogStore;

  // If no data, return empty array
  if (store.catalogs.data.length === 0 && treatmentOptions.length === 0) return [];

  const catalogData = [
    ...(props.offCatalogOption ? [props.offCatalogOption as Treatment] : []),
    ...(store.catalogs.data.length > 0
      ? store.catalogs.data[0].templates.map((x) => x as PrescriptionTemplate)
      : []),
    ...(store.catalogs.data.length > 0
      ? store.catalogs.data[0].treatments.map((x) => x as Treatment)
      : []),
    ...treatmentOptions
  ];

  const searchTerms = searchText.toLowerCase().split(/\s+/); // Split search text by whitespace into individual words

  // If no search text is provided, return all catalog data and treatment options
  if (searchTerms.length === 0) return catalogData;

  // Filter the catalog data and treatment options based on the search text
  return catalogData.filter((item) => {
    const itemName =
      'treatment' in item ? item.treatment.name.toLowerCase() : item.name.toLowerCase();

    // Ensure every search term is found in the item name
    return searchTerms.every((term) => itemName.includes(term));
  });
}

const boldSubstring = (inputString: string, substring: string) => {
  const substrings = substring.split(' ').filter((part: string) => part.length > 0);
  const regex = new RegExp(`(${substrings.join('|')})`, 'gi');
  const parts = inputString.split(regex);
  return parts.map((part) => {
    if (substrings.some((sub: string) => sub.toLowerCase() === part?.toLowerCase())) {
      return <strong class="font-extrabold">{part}</strong>;
    } else {
      return part;
    }
  });
};

function displayTreatment(
  t: Treatment | TreatmentOption,
  showFormattedMedicationName: boolean,
  searchText: string
) {
  return showFormattedMedicationName ? (
    <p class="text-sm whitespace-normal leading-snug my-1">{boldSubstring(t.name, searchText)}</p>
  ) : (
    t.name || ''
  );
}

function displayPrescriptionTemplate(
  t: PrescriptionTemplate,
  showFormattedMedicationName: boolean,
  searchText: string
) {
  if (showFormattedMedicationName) {
    const refills = t.fillsAllowed ? t.fillsAllowed - 1 : 0;

    return (
      <div class="my-1">
        <div class="text-sm whitespace-normal font-medium mb-1">
          {t.name ? <span class="text-blue-600">({boldSubstring(t.name, searchText)}): </span> : ''}
          {boldSubstring(t.treatment.name, searchText)}
        </div>
        <div class="text-xs text-gray-500 truncate">
          {t.dispenseQuantity} {t.dispenseUnit}, {t.daysSupply}{' '}
          {t.daysSupply === 1 ? 'day' : 'days'} supply, {refills}{' '}
          {refills === 1 ? 'refill' : 'refills'}, {t.instructions}
        </div>
      </div>
    );
  }

  return t.treatment.name;
}

function getGroupsConfig(props: ComponentProps) {
  return [
    {
      label: 'Off Catalog',
      filter: (t: { id: string } | undefined) =>
        t && typeof t === 'object' && props.offCatalogOption && t.id === props.offCatalogOption.id
    },
    {
      label: 'Personal Templates',
      filter: (t: { id: string; isPrivate?: boolean } | undefined) =>
        t && typeof t === 'object' && 'treatment' in t && t.isPrivate
    },
    {
      label: 'Organization Templates',
      filter: (t: { id: string; isPrivate?: boolean } | undefined) =>
        t && typeof t === 'object' && 'treatment' in t && !t.isPrivate
    },
    {
      label: 'Organization Catalog',
      filter: (t: { id: string; __typename?: string } | undefined) =>
        t &&
        typeof t === 'object' &&
        'name' in t &&
        !('treatment' in t) &&
        !(t.__typename === 'TreatmentOption')
    },
    {
      label: 'All Treatments',
      filter: (t: { id: string; __typename?: string } | undefined) =>
        t && typeof t === 'object' && !('treatment' in t) && t.__typename === 'TreatmentOption'
    }
  ];
}

// Component Definition

interface ComponentProps {
  label?: string;
  required?: boolean;
  invalid?: boolean;
  helpText?: string;
  catalogId?: string;
  disabled: boolean;
  formName?: string;
  selected?: Treatment | PrescriptionTemplate | TreatmentOption;
  offCatalogOption?: Medication;
}

const Component = (props: ComponentProps) => {
  let ref: any;
  const client = usePhoton();
  const { store, actions } = CatalogStore;
  const [searchText, setSearchText] = createSignal<string>('');
  const [options, setOptions] = createSignal<any[]>([]);
  const [loadingTreatmentOptions, setLoadingTreatmentOptions] = createSignal<boolean>(false);
  const [showFullWidthSearch, setShowFullWidthSearch] = createSignal<boolean>(false);

  onMount(async () => {
    await actions.getCatalogs(client!.getSDK());

    // Once the catalogs are fetched and available, populate the initial options
    if (store.catalogs.data.length > 0) {
      setOptions(getFilteredData(props, searchText(), []));
    }
  });

  const debouncedLoadTreatmentOptions = debounce(async (searchTerm: string) => {
    setLoadingTreatmentOptions(true);

    const treatmentOptions = searchTerm
      ? await loadTreatmentOptions(client!.sdk.apolloClinical, searchTerm)
      : // Set treatment options to empty array if search term is empty
        [];
    const filteredData = getFilteredData(props, searchText(), treatmentOptions);
    setOptions(filteredData);

    setLoadingTreatmentOptions(false);
  }, 250);

  createEffect(() => {
    debouncedLoadTreatmentOptions(searchText());
  });

  const displayAccessor = (
    t: Treatment | PrescriptionTemplate | TreatmentOption,
    showFormattedMedicationName: boolean
  ) => {
    if (t && '__typename' in t && t.__typename == 'PrescriptionTemplate') {
      return displayPrescriptionTemplate(
        t as PrescriptionTemplate,
        showFormattedMedicationName,
        searchText()
      );
    }
    return displayTreatment(
      t as Treatment | TreatmentOption,
      showFormattedMedicationName,
      searchText()
    );
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchTreatmentSelected(ref, e.detail.data, store.catalogs.data![0]?.id || '');
      }}
    >
      {/* Mobile */}

      {/* Full size search */}
      <Show when={showFullWidthSearch()}>
        <PhotonMedicationDropdownFullWidth
          data={options()}
          groups={getGroupsConfig(props)}
          label={props.label}
          disabled={props.disabled}
          required={props.required ?? false}
          placeholder="Type medication"
          invalid={props.invalid ?? false}
          isLoading={store.catalogs.isLoading || loadingTreatmentOptions()}
          hasMore={false}
          selectedData={props.selected ?? (props.offCatalogOption as Treatment)}
          displayAccessor={displayAccessor}
          searchText={searchText()}
          onSearchChange={(s: string) => setSearchText(s)}
          onHide={() => setSearchText('')}
          helpText={props.helpText}
          open={showFullWidthSearch()}
          onClose={() => {
            setShowFullWidthSearch(false);
            setSearchText('');
          }}
        />
      </Show>
      {/* Dummy input that is primarily used here to open the full size flavor */}
      <Show when={isMobile && !showFullWidthSearch()}>
        <PhotonDropdown
          data={options()}
          groups={getGroupsConfig(props)}
          label={props.label}
          disabled={props.disabled}
          required={props.required ?? false}
          placeholder="Type medication"
          invalid={props.invalid ?? false}
          isLoading={store.catalogs.isLoading}
          hasMore={false}
          selectedData={props.selected ?? (props.offCatalogOption as Treatment)}
          displayAccessor={displayAccessor}
          onSearchChange={(s: string) => setSearchText(s)}
          onHide={() => setSearchText('')}
          helpText={props.helpText}
          onInputFocus={() => {
            setShowFullWidthSearch(true);
            if (props.selected?.name) {
              setSearchText(props.selected.name);
            }
          }}
        />
      </Show>

      {/* Desktop */}

      {/* Inline search */}
      <Show when={!isMobile}>
        <PhotonMedicationDropdown
          data={options()}
          groups={getGroupsConfig(props)}
          label={props.label}
          disabled={props.disabled}
          required={props.required ?? false}
          placeholder="Type medication"
          invalid={props.invalid ?? false}
          isLoading={store.catalogs.isLoading || loadingTreatmentOptions()}
          hasMore={false}
          selectedData={props.selected ?? (props.offCatalogOption as Treatment)}
          displayAccessor={displayAccessor}
          searchText={searchText()}
          setSearchText={setSearchText}
          onSearchChange={(s: string) => setSearchText(s)}
          onHide={() => setSearchText('')}
          helpText={props.helpText}
          onInputFocus={() => {
            if (props.selected?.name) {
              setSearchText(props.selected.name);
            }
          }}
        />
      </Show>
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
