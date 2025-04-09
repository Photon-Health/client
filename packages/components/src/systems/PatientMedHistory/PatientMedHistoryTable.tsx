import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import {
  formatDate,
  formatPrescriptionDetails,
  generateString,
  Icon,
  PrescriptionFormData,
  Text,
  useRecentOrders
} from '../../';
import { Treatment } from '@photonhealth/sdk/dist/types';
import { IconButton } from '../../particles/IconButton';
import clsx from 'clsx';
import { MedHistoryPrescription } from './index';
import { format } from 'date-fns';

export type MedHistoryRowItem = {
  treatment: Treatment;
  prescription?: MedHistoryPrescription;
};

export type PatientMedHistoryTableProps = {
  enableLinks: boolean;
  enableRefillButton: boolean;
  rowItems?: MedHistoryRowItem[] | undefined;
  baseURL: string;
  onSortOrderToggle: () => void;
  sortOrder: 'asc' | 'desc';
  onRefillClick: (prescription: PrescriptionFormData) => Promise<void>;
};

export default function PatientMedHistoryTable(props: PatientMedHistoryTableProps) {
  const [ordersState] = useRecentOrders();
  const [isCreatingPrescriptionId, setIsCreatingPrescriptionId] = createSignal<string | undefined>(
    undefined
  );

  const showRefillColumn = createMemo(() => {
    return props.enableRefillButton;
  });

  const gridHeaderClass = createMemo(() =>
    clsx(
      'grid grid-cols-subgrid border-b text-xs font-semibold text-gray-900 sticky top-0 bg-white z-10',
      {
        'col-span-3': showRefillColumn(),
        'col-span-2': !showRefillColumn()
      }
    )
  );

  const callRefillClick = async (prescription: MedHistoryPrescription, treatment: Treatment) => {
    if (isCreatingPrescriptionId() === undefined) {
      setIsCreatingPrescriptionId(prescription.id);
      await props.onRefillClick({
        ...prescription,
        treatment,
        effectiveDate: format(new Date(), 'yyyy-MM-dd').toString()
      });
      setIsCreatingPrescriptionId(undefined);
    }
  };

  return (
    <div
      class="grid w-full text-xs relative"
      style={{
        'grid-template-columns': `1fr min-content ${showRefillColumn() ? 'min-content' : ''}`
      }}
    >
      <div class={gridHeaderClass()}>
        <div class="px-4 sm:px-6 py-3.5">Medication</div>
        <div
          class="px-4 sm:px-6 py-3.5 cursor-pointer flex"
          onClick={() => props.onSortOrderToggle()}
        >
          Written
          <div class="ml-1">
            <Show when={props.sortOrder === 'desc'}>
              <Icon name="chevronDown" size="sm" />
            </Show>
            <Show when={props.sortOrder === 'asc'}>
              <Icon name="chevronUp" size="sm" />
            </Show>
          </div>
        </div>
        <Show when={props.enableRefillButton}>
          <div class="px-4 sm:px-6 py-3.5">Actions</div>
        </Show>
      </div>

      <Show
        when={!ordersState.isLoading && props.rowItems}
        fallback={
          <>
            <LoadingRowFallback enableRefill={props.enableRefillButton} />
            <LoadingRowFallback enableRefill={props.enableRefillButton} />
            <LoadingRowFallback enableRefill={props.enableRefillButton} />
          </>
        }
      >
        <For each={props.rowItems}>
          {(rowItem) => (
            <>
              <div class="px-4 sm:px-6 py-4 truncate">
                <div class="flex-col flex-1 min-w-0 whitespace-normal">
                  <MedicationName
                    treatmentName={rowItem.treatment.name}
                    prescriptionId={rowItem.prescription?.id}
                    enableLinks={props.enableLinks}
                    linkBaseUrl={props.baseURL}
                  />
                  <div class="text-gray-500 text-ellipsis overflow-hidden">
                    {formatPrescriptionDetails(rowItem.prescription)}
                  </div>
                </div>
              </div>
              <div class="px-4 sm:px-6 py-4 self-center">{presentWrittenAt(rowItem)}</div>

              <Show when={props.enableRefillButton}>
                <div class="px-4 sm:px-6 py-4 m-auto">
                  <IconButton
                    iconName="documentPlus"
                    iconSize="sm"
                    label="Refill"
                    onClick={() => {
                      if (rowItem.prescription) {
                        console.log('rowItem.prescription', rowItem.prescription);
                        callRefillClick(rowItem.prescription, rowItem.treatment);
                      }
                    }}
                    disabled={!rowItem.prescription}
                    loading={isCreatingPrescriptionId() === rowItem.prescription?.id}
                  />
                </div>
              </Show>
            </>
          )}
        </For>
      </Show>
      <Show when={!ordersState.isLoading && props.rowItems && props.rowItems.length === 0}>
        <div class="px-4 sm:px-6 py-4 col-span-3 text-center">
          <Text color="gray">No medication history found.</Text>
        </div>
      </Show>
    </div>
  );
}

const LoadingRowFallback = (props: { enableRefill: boolean }) => {
  const cellClasses = 'px-4 sm:px-6 py-4 select-none';
  return (
    <>
      <div class={cellClasses}>
        <Text sampleLoadingText={generateString(10, 25)} loading />
      </div>
      <div class={cellClasses}>
        <Text sampleLoadingText="aaaaa" loading />
      </div>
      <Show when={props.enableRefill}>
        <div class={cellClasses}>
          <Text sampleLoadingText="aaa" loading />
        </div>
      </Show>
    </>
  );
};

function presentWrittenAt(med: MedHistoryRowItem) {
  if (!med.prescription) {
    return 'External';
  }
  return formatDate(med.prescription?.writtenAt) || 'N/A';
}

interface MedicationNameProps {
  enableLinks: boolean;
  link?: string;
  linkBaseUrl: string;
  treatmentName: string;
  prescriptionId?: string;
}

const MedicationName: Component<MedicationNameProps> = (props) => {
  const canShowLink = createMemo<boolean>(() => {
    return props.enableLinks && !!props.prescriptionId;
  });

  return (
    <>
      <Show when={!canShowLink()}>
        <div class="text-ellipsis overflow-hidden">{props.treatmentName}</div>
      </Show>
      <Show when={canShowLink()}>
        <a
          href={`${props.linkBaseUrl}${props.prescriptionId}`}
          class="text-ellipsis block overflow-hidden text-blue-500 underline"
          target="_blank"
        >
          {props.treatmentName}
        </a>
      </Show>
    </>
  );
};
