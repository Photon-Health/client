import { SearchMedication } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal } from 'solid-js';
import { usePhotonClient } from '@photonhealth/components';
import { gql } from '@apollo/client';
import { debounce } from '@solid-primitives/scheduled';
import { PhotonDropdown } from '../../photon-dropdown';

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
    <div
      class="w-full"
      on:photon-data-selected={(e: { detail: { data: SearchMedication } }) => {
        props.setConcept(e.detail.data);
      }}
    >
      <PhotonDropdown
        data={data()}
        label={'Medication Name'}
        placeholder="Enter a medication name..."
        isLoading={isLoading()}
        hasMore={false}
        displayAccessor={(p, groupAccess) =>
          groupAccess ? (
            <p class="text-sm whitespace-normal leading-snug mb-2">{p?.name || ''}</p>
          ) : (
            p?.name || ''
          )
        }
        onSearchChange={setFilterText}
        onHide={() => setFilterText('')}
        noDataMsg={'No medications found'}
        required={false}
      />
    </div>
  );
};
