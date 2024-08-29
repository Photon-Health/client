// Solid
import { customElement } from 'solid-element';
import { createMemo, createSignal, onMount, Show } from 'solid-js';

// Photon
import { usePhoton } from '../context';
import { PhotonMedicationDropdownMobile } from '../photon-medication-dropdown-mobile';
import { PhotonDropdown } from '../photon-dropdown';

// Types
import {
  Medication,
  Treatment,
  PrescriptionTemplate,
  MedicationType
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

const SearchTreatmentoptions = gql`
  query SearchTreatmentOptions($searchTerm: String!) {
    treatmentOptions(searchTerm: $searchTerm) {
      medicationId
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

export type TreatmentOption = {
  medicationId: string;
  name: string;
  ndc: string;
  form?: string;
  route?: string;
  strength?: string;
  type?: MedicationType;
  __typename: string;
};

const searchTreatmentoptions = async (
  client: ApolloClient<any>,
  searchTerm: string
): Promise<DataReturn<{ treatmentOptions: TreatmentOption[] }>> => {
  return await client.query<{ treatmentOptions: TreatmentOption[] }>({
    query: SearchTreatmentoptions,
    variables: { searchTerm },
    fetchPolicy: 'no-cache'
  });
};

async function loadData(client: ApolloClient<any>, searchText: string): Promise<TreatmentOption[]> {
  const req = await searchTreatmentoptions(client, searchText);
  return req?.data?.treatmentOptions ?? [];
}

function getFilteredData(
  props: ComponentProps,
  searchText: string,
  treatmentOptions: TreatmentOption[]
): (Treatment | PrescriptionTemplate | TreatmentOption)[] {
  const { store } = CatalogStore;

  if (store.catalogs.data.length === 0) return [];

  const catalogData = [
    ...(props.offCatalogOption ? [props.offCatalogOption as Treatment] : []),
    ...store.catalogs.data[0].templates.map((x) => x as PrescriptionTemplate),
    ...store.catalogs.data[0].treatments.map((x) => x as Treatment),
    ...treatmentOptions
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
  groupAccess: boolean,
  searchText: string
) {
  return groupAccess ? (
    <p class="text-sm whitespace-normal leading-snug my-1">{boldSubstring(t.name, searchText)}</p>
  ) : (
    t.name || ''
  );
}

function displayPrescriptionTemplate(
  t: PrescriptionTemplate,
  groupAccess: boolean,
  searchText: string
) {
  if (groupAccess) {
    const refills = t.fillsAllowed ? t.fillsAllowed - 1 : 0;

    return (
      <div class="my-1">
        <div class="text-sm whitespace-normal font-medium mb-1">
          {t.name ? <span class="text-blue-600">({boldSubstring(t.name, searchText)}): </span> : ''}
          {boldSubstring(t.treatment.name, searchText)}
        </div>
        <div class="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
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
      filter: (t: any) =>
        t && typeof t === 'object' && 'name' in t && !('treatment' in t) && !('medicationId' in t)
    },
    {
      label: 'ALL TREATMENTS',
      filter: (t: any) => t && typeof t === 'object' && 'medicationId' in t
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
  const [treatmentOptions, setTreatmentOptions] = createSignal<TreatmentOption[]>([]);
  const [enableFullWidthMedicationSearch, setEnableFullWidthMedicationSearch] =
    createSignal<boolean>(false);

  onMount(async () => {
    await actions.getCatalogs(client!.getSDK());
  });

  createMemo(async () => {
    const options = await loadData(client!.sdk.apolloClinical, searchText());
    setTreatmentOptions(options);
  });

  const data = createMemo(() => getFilteredData(props, searchText(), treatmentOptions()));

  const displayAccessor = (
    t: Treatment | PrescriptionTemplate | TreatmentOption,
    groupAccess: boolean
  ) => {
    if (t && '__typename' in t && t.__typename == 'PrescriptionTemplate') {
      return displayPrescriptionTemplate(t as PrescriptionTemplate, groupAccess, searchText());
    }
    return displayTreatment(t as Treatment | TreatmentOption, groupAccess, searchText());
  };

  return (
    <div
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchTreatmentSelected(ref, e.detail.data, store.catalogs.data![0]?.id || '');
      }}
    >
      <Show when={enableFullWidthMedicationSearch()}>
        <PhotonMedicationDropdownMobile
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
          searchText={searchText()}
          onSearchChange={(s: string) => setSearchText(s)}
          onHide={() => setSearchText('')}
          helpText={props.helpText}
          open={enableFullWidthMedicationSearch()}
          onClose={() => {
            setEnableFullWidthMedicationSearch(false);
            setSearchText('');
          }}
        />
      </Show>
      <Show when={!enableFullWidthMedicationSearch()}>
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
          onInputFocus={() => {
            setEnableFullWidthMedicationSearch(true);
            if (props.selected) {
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
