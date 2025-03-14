import { createSignal, For, Show } from 'solid-js';
import { formatDate, formatPrescriptionDetails, generateString, Icon, Table, Text } from '../../';
import { PatientTreatmentHistoryElement } from './index';

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
          <span class="cursor-pointer flex" onClick={() => props.onChronologicalChange}>
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
                    <div class="flex-col flex-1 min-w-0">
                      <div
                        class={`${
                          expandedRows().has(med.treatment.id) ? '' : 'whitespace-nowrap'
                        } text-ellipsis overflow-hidden`}
                      >
                        {med.treatment.name}
                      </div>
                      <div class="text-gray-500">
                        <div
                          class={`${
                            expandedRows().has(med.treatment.id) ? '' : 'whitespace-nowrap'
                          } text-ellipsis overflow-hidden`}
                        >
                          {formatPrescriptionDetails(med.prescription)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(med.treatment?.id)}
                      class="text-blue-500 hover:text-blue-700 text-sm ml-2 self-stretch flex items-center"
                    >
                      <Icon
                        name={expandedRows().has(med.treatment?.id) ? 'minus' : 'plus'}
                        size="sm"
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
              </Table.Row>
            )}
          </For>
        </Show>
      </Table.Body>
    </Table>
  );
}
