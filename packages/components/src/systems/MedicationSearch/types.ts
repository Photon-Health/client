import { JSXElement } from 'solid-js';
import { Medication, PrescriptionTemplate, Treatment } from '@photonhealth/sdk/dist/types';

/** Off-catalog search result with a runtime flag to distinguish from in-catalog treatments */
export type TreatmentWithOffCatalog = Treatment & { isOffCatalog: true };

/** Union of all item types that can appear in medication search results */
export type MedicationSearchItem = Treatment | PrescriptionTemplate | TreatmentWithOffCatalog;

/** A treatment that was explicitly added via the med-history dialog */
export type OffCatalogOption = Medication | undefined;

export interface DisabledItem {
  treatmentIds?: string[];
  reason?: string;
}

export type DisableList = DisabledItem[];

export interface DisabledResult {
  disabled?: boolean;
  disableReason?: string;
}

/** Map of treatmentId -> disable reason (or undefined if no reason given) */
export type BlockedMedsMap = Record<string, string | undefined>;

export interface TreatmentSelectedDetail {
  data: MedicationSearchItem;
  catalogId?: string;
}

/** Main MedicationSearch component props */
export interface MedicationSearchProps {
  label?: string;
  required?: boolean;
  invalid?: boolean;
  helpText?: string;
  catalogId?: string;
  allowOffCatalogSearch?: boolean;
  disabled?: boolean;
  selected?: MedicationSearchItem;
  offCatalogOption?: OffCatalogOption;
  searchText?: string;
  disableList?: DisableList;
  onTreatmentSelected?: (detail: TreatmentSelectedDetail) => void;
  onTreatmentUnselected?: () => void;
  onSearchTextChanged?: (text: string) => void;
  onMedicationSelected?: (medication: Medication) => void;
}

export interface GroupConfig {
  label: string;
  filter: (item: MedicationSearchItem) => boolean;
}

/** A group title row in the virtualized list */
export interface GroupTitle {
  title: string;
}

/** A data item row in the virtualized list */
export interface DataItem {
  data: MedicationSearchItem;
  allItemsIdx: number;
}

/** Union type for rows in the virtualized list */
export type GroupedItem = GroupTitle | DataItem;

/** Type guard for GroupTitle */
export function isGroupTitle(item: GroupedItem): item is GroupTitle {
  return 'title' in item;
}

/** Type guard for DataItem */
export function isDataItem(item: GroupedItem): item is DataItem {
  return 'data' in item;
}

/** Display function for rendering an item row */
export type DisplayAccessor = (
  item: MedicationSearchItem,
  groupDisplay: boolean,
  searchText: string,
  disabled?: boolean,
  disableReason?: string
) => JSXElement;

/** Shared props for both desktop and mobile dropdown internals */
export interface MedicationSearchDropdownProps {
  data: MedicationSearchItem[];
  groups: GroupConfig[];
  searchText: string;
  selectedData?: MedicationSearchItem;
  displayAccessor: DisplayAccessor;
  isLoading: boolean;
  hasMore: boolean;
  label?: string;
  required?: boolean;
  invalid?: boolean;
  helpText?: string;
  disabled?: boolean;
  placeholder?: string;
  onSearchChange: (text: string) => void;
  onSelect: (item: MedicationSearchItem) => void;
  onDeselect: () => void;
  onOpen?: () => void;
  onHide?: () => void;
  fetchMore?: () => void;
}

/** Additional props for the mobile fullscreen overlay */
export interface MedicationSearchMobileProps extends MedicationSearchDropdownProps {
  open: boolean;
  onClose: () => void;
}