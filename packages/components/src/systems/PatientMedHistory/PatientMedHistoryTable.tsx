import { createSignal, For, Show } from 'solid-js';
import { formatDate, formatPrescriptionDetails, generateString, Icon, Table, Text } from '../../';
import { PatientTreatmentHistoryElement } from './index';
import { Prescription } from '@photonhealth/sdk/dist/types';

const LoadingRowFallback = (props: { enableLinks: boolean }) => (
  <Table.Row>
    <Table.Cell>
      <Text sampleLoadingText={generateString(10, 25)} loading />
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString(2, 8)} loading />
    </Table.Cell>
    <Show when={props.enableLinks}>
      <Table.Cell>
        <Text sampleLoadingText={generateString(4, 8)} loading />
      </Table.Cell>
    </Show>
  </Table.Row>
);

export type PatientMedHistoryTableProps = {
  enableLinks: boolean;
  medHistory?: PatientTreatmentHistoryElement[] | undefined;
  baseURL: string;
  onChronologicalChange: () => void;
  chronological: boolean;
  onRefillClick: (prescription: Prescription) => void;
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

  return (
    <Table>
      <Table.Header>
        <Table.Col width="16rem">Medication</Table.Col>
        <Table.Col>
          <span class="cursor-pointer flex" onClick={() => props.onChronologicalChange()}>
            Written
            <div class="ml-1">
              <Show when={props.chronological}>
                <Icon name="chevronDown" size="sm" />
              </Show>
              <Show when={!props.chronological}>
                <Icon name="chevronUp" size="sm" />
              </Show>
            </div>
          </span>
        </Table.Col>
        <Show when={props.enableLinks}>
          <Table.Col>Source</Table.Col>
        </Show>
        <Table.Col>Actions</Table.Col>
      </Table.Header>
      <Table.Body>
        <Show
          when={props.medHistory}
          fallback={
            <>
              <LoadingRowFallback enableLinks={props.enableLinks} />
              <LoadingRowFallback enableLinks={props.enableLinks} />
              <LoadingRowFallback enableLinks={props.enableLinks} />
            </>
          }
        >
          <For each={props.medHistory}>
            {(med) => (
              <Table.Row>
                <Table.Cell width="16rem">
                  <div class="flex items-stretch h-full">
                    <div
                      class={`flex-col flex-1 min-w-0 ${
                        expandedRows().has(med.treatment.id) ? '' : 'whitespace-nowrap'
                      }`}
                    >
                      <div class="text-ellipsis overflow-hidden">{med.treatment.name}</div>
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
                </Table.Cell>
                <Table.Cell>{formatDate(med.prescription?.writtenAt) || 'N/A'}</Table.Cell>
                <Show when={props.enableLinks}>
                  <Table.Cell>
                    {med.prescription?.id ? (
                      <a
                        class="text-blue-500 underline"
                        target="_blank"
                        href={`${props.baseURL}${med.prescription?.id}`}
                      >
                        Link
                      </a>
                    ) : (
                      'External'
                    )}
                  </Table.Cell>
                </Show>
                <Show when={med.prescription !== undefined}>
                  <Table.Cell>
                    <button
                      type="button"
                      onClick={() => med.prescription && props.onRefillClick(med.prescription)}
                      aria-label={`Refill ${med.treatment.name}`}
                      class="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      <Icon name="documentPlus" size="sm" aria-hidden="true" />
                    </button>
                  </Table.Cell>
                </Show>
              </Table.Row>
            )}
          </For>
        </Show>
      </Table.Body>
    </Table>
  );
}
