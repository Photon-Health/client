import { SearchMedication } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal, untrack } from 'solid-js';
import { usePhotonClient } from '@photonhealth/components';
import { gql } from '@apollo/client';
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
  setConceptId: (id: string) => void;
};

export const MedicationConceptDropdown = (props: MedicationConceptDropdownProps) => {
  const client = usePhotonClient();
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [filterText, setFilterText] = createSignal<string>('');
  const [uid, setUid] = createSignal<string>();
  const [data, setData] = createSignal<SearchMedication[]>([]);

  createEffect(() => {
    if (filterText().length > 0) {
      setIsLoading(true);

      const id = String(Math.random());
      setUid(id);

      const fetchData = async () => {
        const { data } = await client!.apollo.query({
          query: GET_CONCEPTS,
          variables: { name: filterText() }
        });

        untrack(() => {
          if (id === uid()) {
            setData(
              data?.medicationConcepts
                ? [...data.medicationConcepts].sort((a, b) => a.name.localeCompare(b.name))
                : []
            );
          }
          setIsLoading(false);
        });
      };

      fetchData();
    }
  });

  return (
    <div
      class="w-full"
      on:photon-data-selected={(e: any) => {
        props.setConceptId(e.detail.data.id);
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
