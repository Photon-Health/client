import { SearchMedication } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal, For } from 'solid-js';
import { usePhotonClient, ComboBox, Text } from '@photonhealth/components';
// import { Combobox } from 'terracotta';

import { gql } from '@apollo/client';
import { debounce } from '@solid-primitives/scheduled';

const GET_CONCEPTS = gql`
  query GetConcept($name: String!) {
    medicationConcepts(name: $name) {
      id
      name
    }
  }
`;

type MedicationConceptDropdownProps = {
  conceptId?: string;
  setConcept: (concept: SearchMedication) => void;
};

export const MedicationConceptDropdown = (props: MedicationConceptDropdownProps) => {
  const client = usePhotonClient();
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [filterText, setFilterText] = createSignal<string>('');
  const [data, setData] = createSignal<SearchMedication[]>([]);

  const fetchData = debounce(async (name: string) => {
    const { data } = await client!.apollo.query({
      query: GET_CONCEPTS,
      variables: { name }
    });

    setData(
      data?.medicationConcepts
        ? [...data.medicationConcepts].sort((a, b) => a.name.localeCompare(b.name))
        : []
    );

    setIsLoading(false);
  }, 300);

  createEffect(() => {
    if (filterText().length > 0) {
      setIsLoading(true);
      fetchData(filterText());
    }
  });

  createEffect(() => {
    if (!props.conceptId) {
      setData([]);
    }
  });

  return (
    <div class="w-full">
      <Text color="gray">Medication History</Text>
      <ComboBox
        loading={isLoading()}
        setSelected={(med: SearchMedication) => {
          console.log('aoeuaoeuaoe', med());
        }}
      >
        <ComboBox.Input
          onInput={(e: KeyboardEvent) =>
            setFilterText((e?.currentTarget as HTMLTextAreaElement).value)
          }
          displayValue={(med: SearchMedication) => med.name}
        />
        <ComboBox.Options>
          <For each={data()}>
            {(med) => (
              <ComboBox.Option key={med.id} value={med}>
                {med.name}
              </ComboBox.Option>
            )}
          </For>
        </ComboBox.Options>
      </ComboBox>
    </div>
  );
};
