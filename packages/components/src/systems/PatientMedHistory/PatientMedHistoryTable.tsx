import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import { formatDate, formatPrescriptionDetails, generateString, Icon, Text } from '../../';
import { PatientTreatmentHistoryElement } from './index';
import { Treatment } from '@photonhealth/sdk/dist/types';
import { IconButton } from '../../particles/IconButton';
import { debounce } from '@solid-primitives/scheduled';
import clsx from 'clsx';

export type PatientMedHistoryTableProps = {
  enableLinks: boolean;
  enableRefillButton: boolean;
  medHistory?: PatientTreatmentHistoryElement[] | undefined;
  baseURL: string;
  onChronologicalChange: () => void;
  chronological: boolean;
  onRefillClick: (prescriptionId: string, treatment: Treatment) => void;
};

export default function PatientMedHistoryTable(props: PatientMedHistoryTableProps) {
  const [expandedRows, setExpandedRows] = createSignal<Set<string>>(new Set());

  const toggleExpand = (medId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(medId)) {
        newSet.delete(medId);
      } else {
        newSet.add(medId);
      }
      return newSet;
    });
  };

  const debouncedRefill = createMemo(() => {
    const onRefillClick = props.onRefillClick;
    return debounce(async (prescriptionId: string, treatment: Treatment) => {
      onRefillClick(prescriptionId, treatment);
    }, 300);
  });

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

  return (
    <div
      class="grid w-full text-xs relative"
      style={{
        'grid-template-columns': `1fr min-content ${showRefillColumn() ? 'min-content' : ''}`
      }}
    >
      <div class={gridHeaderClass()}>
        <div class="px-4 py-3.5">Medication</div>
        <div class="px-4 py-3.5 cursor-pointer flex" onClick={() => props.onChronologicalChange()}>
          Written
          <div class="ml-1">
            <Show when={props.chronological}>
              <Icon name="chevronDown" size="sm" />
            </Show>
            <Show when={!props.chronological}>
              <Icon name="chevronUp" size="sm" />
            </Show>
          </div>
        </div>
        <Show when={props.enableRefillButton}>
          <div class="px-4 py-3.5">Actions</div>
        </Show>
      </div>

      <Show
        when={props.medHistory}
        fallback={
          <>
            <LoadingRowFallback enableRefill={props.enableRefillButton} />
            <LoadingRowFallback enableRefill={props.enableRefillButton} />
            <LoadingRowFallback enableRefill={props.enableRefillButton} />
          </>
        }
      >
        <For each={props.medHistory}>
          {(med) => (
            <>
              <div class="px-4 py-4 truncate">
                <div class="flex">
                  <div
                    class={`flex-col flex-1 min-w-0 ${
                      expandedRows().has(med.treatment.id) ? 'whitespace-normal' : ''
                    }`}
                  >
                    <MedicationName
                      med={med}
                      enableLinks={props.enableLinks}
                      link={`${props.baseURL}${med.prescription?.id}`}
                    />
                    <div class="text-gray-500 text-ellipsis overflow-hidden">
                      {formatPrescriptionDetails(med.prescription)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(med.treatment?.id)}
                    class="text-blue-500 hover:text-blue-700 text-sm ml-2 self-stretch flex items-center"
                    aria-expanded={expandedRows().has(med.treatment?.id)}
                    aria-label={
                      expandedRows().has(med.treatment?.id)
                        ? 'Collapse medication details'
                        : 'Expand medication details'
                    }
                  >
                    <Icon
                      name={expandedRows().has(med.treatment?.id) ? 'minus' : 'plus'}
                      size="sm"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              <div class="px-4 py-4 self-center">{presentWrittenAt(med)}</div>

              <Show when={props.enableRefillButton}>
                <div class="px-4 py-4 self-center">
                  <IconButton
                    iconName="documentPlus"
                    iconSize="sm"
                    label="Refill"
                    onClick={() => {
                      if (med.prescription) {
                        debouncedRefill()(med.prescription.id, med.treatment);
                      }
                    }}
                    disabled={!med.prescription}
                  />
                </div>
              </Show>
            </>
          )}
        </For>
      </Show>
    </div>
  );
}

const LoadingRowFallback = (props: { enableRefill: boolean }) => {
  const cellClasses = 'px-4 py-4 select-none';
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

function presentWrittenAt(med: PatientTreatmentHistoryElement) {
  if (!med.prescription) {
    return 'External';
  }
  return formatDate(med.prescription?.writtenAt) || 'N/A';
}

interface MedicationNameProps {
  enableLinks: boolean;
  link?: string;
  med: PatientTreatmentHistoryElement;
}

const MedicationName: Component<MedicationNameProps> = (props) => {
  return (
    <>
      <Show when={!props.enableLinks || !props.med.prescription}>
        <div class="text-ellipsis overflow-hidden">{props.med.treatment.name}</div>
      </Show>
      <Show when={props.enableLinks && props.med.prescription}>
        <a
          href={props.link}
          class="text-ellipsis block overflow-hidden text-blue-500 underline"
          target="_blank"
        >
          {props.med.treatment.name}
        </a>
      </Show>
    </>
  );
};
