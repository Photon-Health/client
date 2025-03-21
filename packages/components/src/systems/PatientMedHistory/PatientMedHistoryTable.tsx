import { Component, createSignal, For, Show } from 'solid-js';
import { formatDate, formatPrescriptionDetails, generateString, Icon, Table, Text } from '../../';
import { PatientTreatmentHistoryElement } from './index';
import { Treatment } from '@photonhealth/sdk/dist/types';
import { IconButton } from '../../particles/IconButton';

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
        <Show when={props.enableRefillButton}>
          <Table.Col>Actions</Table.Col>
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
                    <div
                      class={`flex-col flex-1 min-w-0 ${
                        expandedRows().has(med.treatment.id) ? '' : 'whitespace-nowrap'
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
                </Table.Cell>
                <Table.Cell>{formatDate(med.prescription?.writtenAt) || 'N/A'}</Table.Cell>
                <Show when={props.enableRefillButton}>
                  <Table.Cell>
                    <IconButton
                      iconName="documentPlus"
                      label="Refill"
                      onClick={() =>
                        med.prescription && props.onRefillClick(med.prescription.id, med.treatment)
                      }
                      disabled={!med.prescription}
                    />
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
