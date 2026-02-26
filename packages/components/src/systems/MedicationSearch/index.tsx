import { createEffect, createMemo, createSignal, on, onMount, Show } from 'solid-js';
import { usePhoton } from '../../context';
import { boldSubstring } from '../../utils/boldSubstring';
import { useMediaQuery } from '../../utils/useMediaQuery';
import Input from '../../particles/Input';
import InputGroup from '../../particles/InputGroup';
import Icon from '../../particles/Icon';
import MedicationSearchDesktop from './MedicationSearchDesktop';
import MedicationSearchMobile from './MedicationSearchMobile';
import gql from 'graphql-tag';

import type { ApolloClient } from '@apollo/client';
import type {
  Medication,
  PrescriptionTemplate,
  Treatment,
  TreatmentOption
} from '@photonhealth/sdk/dist/types';
import type {
  BlockedMedsMap,
  DisableList,
  DisplayAccessor,
  GroupConfig,
  MedicationSearchItem,
  MedicationSearchProps,
  TreatmentWithOffCatalog
} from './types';

// --- Utility Functions ---

function createBlockedMedsMap(disableList: DisableList | undefined): BlockedMedsMap {
  if (!disableList || disableList.length === 0) return {};

  return disableList.reduce<BlockedMedsMap>((acc, cur) => {
    if (!cur.treatmentIds) return acc;
    for (const treatmentId of cur.treatmentIds) {
      acc[treatmentId] = cur.reason;
    }
    return acc;
  }, {});
}

function isTreatmentDisabled(
  treatmentId: string | undefined,
  blockedMedsMap: BlockedMedsMap
): { disabled?: boolean; disableReason?: string } {
  if (!treatmentId) return { disabled: false };
  if (treatmentId in blockedMedsMap) {
    return { disabled: true, disableReason: blockedMedsMap[treatmentId] };
  }
  return { disabled: false };
}

// --- GraphQL ---

const SearchTreatmentOptionsQuery = gql`
  query SearchTreatments($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      __typename
      id
      name
    }
  }
`;

async function searchTreatmentOptions(
  client: ApolloClient<any>,
  searchTerm: string
): Promise<Treatment[]> {
  const result = await client.query<{ treatments: Treatment[] }>({
    query: SearchTreatmentOptionsQuery,
    variables: { filter: { term: searchTerm } },
    fetchPolicy: 'no-cache'
  });
  return result?.data?.treatments?.map((t) => ({ ...t, isOffCatalog: true } as TreatmentWithOffCatalog)) ?? [];
}

// --- Display Functions ---

function displayTreatment(
  t: Treatment | TreatmentOption,
  showFormattedMedicationName: boolean,
  searchText: string,
  disabled = false,
  disableReason?: string
) {
  if (showFormattedMedicationName) {
    return (
      <div class={`my-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <p class={`text-sm whitespace-normal leading-snug ${disabled ? 'text-gray-500' : ''}`}>
          {boldSubstring(t.name, searchText)}
        </p>
        {disabled && disableReason && (
          <p class="text-xs text-red-500 mt-1 italic">{disableReason}</p>
        )}
      </div>
    );
  }
  return t.name || '';
}

function displayPrescriptionTemplate(
  t: PrescriptionTemplate,
  showFormattedMedicationName: boolean,
  searchText: string,
  disabled = false,
  disableReason?: string
) {
  if (showFormattedMedicationName) {
    const refills = t.fillsAllowed ? t.fillsAllowed - 1 : 0;
    return (
      <div class={`my-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div
          class={`text-sm whitespace-normal font-medium mb-1 ${disabled ? 'text-gray-500' : ''}`}
        >
          {t.name ? (
            <span class="text-blue-600">({boldSubstring(t.name, searchText)}): </span>
          ) : (
            ''
          )}
          {boldSubstring(t.treatment.name, searchText)}
        </div>
        <div class={`text-xs truncate ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
          {t.dispenseQuantity} {t.dispenseUnit}, {t.daysSupply}{' '}
          {t.daysSupply === 1 ? 'day' : 'days'} supply, {refills}{' '}
          {refills === 1 ? 'refill' : 'refills'}, {t.instructions}
        </div>
        {disabled && disableReason && (
          <p class="text-xs text-red-500 mt-1 italic">{disableReason}</p>
        )}
      </div>
    );
  }
  return t.treatment.name;
}

// --- Filtering & Grouping ---

function getFilteredData(
  offCatalogOption: Medication | undefined,
  treatments: Treatment[],
  templates: PrescriptionTemplate[],
  searchText: string,
  treatmentOptions: Treatment[]
): MedicationSearchItem[] {
  const catalogData: MedicationSearchItem[] = [
    ...(offCatalogOption ? [offCatalogOption as unknown as Treatment] : []),
    ...templates.map((x) => x as PrescriptionTemplate),
    ...treatments.map((x) => x as Treatment),
    ...treatmentOptions
  ];

  const searchTerms = searchText.toLowerCase().split(/\s+/).filter(Boolean);
  if (searchTerms.length === 0) return catalogData;

  return catalogData.filter((item) => {
    const itemName =
      'treatment' in item
        ? `${(item as PrescriptionTemplate)?.name?.toLowerCase() || ''} ${(item as PrescriptionTemplate).treatment.name.toLowerCase()}`
        : item.name.toLowerCase();
    return searchTerms.every((term) => itemName.includes(term));
  });
}

function getGroupsConfig(offCatalogOption: Medication | undefined): GroupConfig[] {
  return [
    {
      label: 'Off Catalog',
      filter: (t) => !!offCatalogOption && 'id' in t && t.id === offCatalogOption.id
    },
    {
      label: 'Personal Templates',
      filter: (t) => 'treatment' in t && !!(t as PrescriptionTemplate).isPrivate
    },
    {
      label: 'Organization Templates',
      filter: (t) => 'treatment' in t && !(t as PrescriptionTemplate).isPrivate
    },
    {
      label: 'Organization Catalog',
      filter: (t) => 'name' in t && !('treatment' in t) && !('isOffCatalog' in t)
    },
    {
      label: 'All Treatments',
      filter: (t) => !('treatment' in t) && 'isOffCatalog' in t
    }
  ];
}

// --- Main Component ---

export default function MedicationSearch(props: MedicationSearchProps) {
  const client = usePhoton();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [options, setOptions] = createSignal<MedicationSearchItem[]>([]);
  const [loadingTreatmentOptions, setLoadingTreatmentOptions] = createSignal(false);
  const [showMobileOverlay, setShowMobileOverlay] = createSignal(false);
  const [searchText, setSearchText] = createSignal(props.searchText ?? '');

  // Sync external searchText prop
  createEffect(
    on(
      () => props.searchText,
      (text) => {
        if (text !== undefined) setSearchText(text);
      }
    )
  );

  const blockedMedsMap = createMemo(() => createBlockedMedsMap(props.disableList));

  const catalogState = () => client?.clinical.catalog.state;
  const catalogsState = () => client?.clinical.catalogs.state;

  const isLoading = () =>
    !!(catalogsState()?.isLoading || catalogState()?.isLoading || loadingTreatmentOptions());

  // Load catalog on mount
  onMount(async () => {
    if (!client) return;
    if (props.catalogId) {
      client.clinical.catalog.getCatalog({ id: props.catalogId });
    } else {
      client.clinical.catalogs.getCatalogs();
    }
  });

  // Once catalogs list loads, fetch the first catalog
  createEffect(() => {
    if (!props.catalogId && catalogsState()?.catalogs?.length) {
      client?.clinical.catalog.getCatalog({ id: catalogsState()!.catalogs[0].id });
    }
  });

  // Re-filter when catalog data or search text changes
  createEffect(() => {
    const treatments = catalogState()?.treatments ?? [];
    const templates = catalogState()?.templates ?? [];
    if (treatments.length > 0 || templates.length > 0) {
      tryLoadTreatmentOptions(searchText());
    }
  });

  const tryLoadTreatmentOptions = async (searchTerm: string) => {
    setLoadingTreatmentOptions(true);

    const treatmentOptions =
      searchTerm?.length >= 3 && props.allowOffCatalogSearch !== false
        ? await searchTreatmentOptions(client!.sdk.apolloClinical, searchTerm)
        : [];

    const treatments = catalogState()?.treatments ?? [];
    const templates = catalogState()?.templates ?? [];
    const filteredData = getFilteredData(
      props.offCatalogOption,
      treatments,
      templates,
      searchText(),
      treatmentOptions
    );
    setOptions(filteredData);
    setLoadingTreatmentOptions(false);
  };

  const displayAccessor: DisplayAccessor = (t, showFormattedMedicationName, search, disabled, disableReason) => {
    const treatmentId = 'treatment' in t ? (t as PrescriptionTemplate).treatment.id : t.id;
    const disabledResult = isTreatmentDisabled(treatmentId, blockedMedsMap());
    const isDisabled = disabled ?? disabledResult.disabled;
    const reason = disableReason ?? disabledResult.disableReason;

    if (t && '__typename' in t && t.__typename === 'PrescriptionTemplate') {
      return displayPrescriptionTemplate(
        t as PrescriptionTemplate,
        showFormattedMedicationName,
        search,
        isDisabled,
        reason
      );
    }
    return displayTreatment(
      t as Treatment | TreatmentOption,
      showFormattedMedicationName,
      search,
      isDisabled,
      reason
    );
  };

  const handleSelect = (item: MedicationSearchItem) => {
    // Check if the selected item is disabled
    const treatmentId = 'treatment' in item
      ? (item as PrescriptionTemplate).treatment.id
      : item.id;
    const { disabled } = isTreatmentDisabled(treatmentId, blockedMedsMap());
    if (disabled) return;

    const catalogId = catalogState()?.treatments?.length
      ? (client?.clinical.catalogs.state.catalogs?.[0]?.id ?? props.catalogId ?? '')
      : '';

    props.onTreatmentSelected?.({ data: item, catalogId });

    const displayName = 'treatment' in item
      ? (item as PrescriptionTemplate).treatment.name
      : item.name;
    setSearchText(displayName);
    props.onSearchTextChanged?.(displayName);
  };

  const handleDeselect = () => {
    props.onTreatmentUnselected?.();
    setSearchText('');
    props.onSearchTextChanged?.('');
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    props.onSearchTextChanged?.(text);
    tryLoadTreatmentOptions(text);
  };

  const groups = createMemo(() => getGroupsConfig(props.offCatalogOption));

  const sharedProps = () => ({
    data: options(),
    groups: groups(),
    searchText: searchText(),
    selectedData: props.selected ?? (props.offCatalogOption as unknown as MedicationSearchItem),
    displayAccessor,
    isLoading: isLoading(),
    hasMore: false,
    label: props.label,
    required: props.required,
    invalid: props.invalid,
    helpText: props.helpText,
    disabled: props.disabled,
    placeholder: 'Type medication',
    onSearchChange: handleSearchChange,
    onSelect: handleSelect,
    onDeselect: handleDeselect
  });

  return (
    <>
      {/* Mobile: readonly trigger input + fullscreen overlay */}
      <Show when={isMobile()}>
        <InputGroup
          label={props.label}
          required={props.required}
          error={props.invalid ? props.helpText : undefined}
        >
          <div class="relative">
            <Input
              type="text"
              placeholder="Type medication"
              value={searchText()}
              readonly
              disabled={props.disabled}
              onFocus={() => {
                setShowMobileOverlay(true);
                if (props.selected?.name) {
                  setSearchText(props.selected.name);
                  props.onSearchTextChanged?.(props.selected.name);
                }
              }}
            />
            <Show when={props.selected || searchText()}>
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeselect();
                }}
                aria-label="Clear selection"
              >
                <Icon name="xMark" size="sm" />
              </button>
            </Show>
          </div>
        </InputGroup>

        <MedicationSearchMobile
          {...sharedProps()}
          open={showMobileOverlay()}
          onClose={() => setShowMobileOverlay(false)}
        />
      </Show>

      {/* Desktop: inline dropdown */}
      <Show when={!isMobile()}>
        <MedicationSearchDesktop
          {...sharedProps()}
          onOpen={() => {
            if (props.selected?.name) {
              setSearchText(props.selected.name);
              props.onSearchTextChanged?.(props.selected.name);
            }
          }}
        />
      </Show>
    </>
  );
}

export type { MedicationSearchProps } from './types';