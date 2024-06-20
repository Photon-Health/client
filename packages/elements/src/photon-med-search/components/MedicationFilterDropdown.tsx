import { Medication, SearchMedication } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal, createMemo, Show, For } from 'solid-js';
import { gql } from '@apollo/client';
import { usePhotonClient, ComboBox, Text } from '@photonhealth/components';
import { PhotonDropdown } from '../../photon-dropdown';

const GET_FORMS = gql`
  query GetForms($medId: String!) {
    medicationForms(id: $medId) {
      id
      form
    }
  }
`;

const GET_STRENGTHS = gql`
  query GetStrengths($medId: String!) {
    medicationStrengths(id: $medId) {
      id
      name
    }
  }
`;

const GET_ROUTES = gql`
  query GetRoutes($medId: String!) {
    medicationRoutes(id: $medId) {
      id
      name
    }
  }
`;

const filters = {
  STRENGTH: {
    query: GET_STRENGTHS,
    key: 'medicationStrengths'
  },
  ROUTE: {
    query: GET_ROUTES,
    key: 'medicationRoutes'
  },
  FORM: {
    query: GET_FORMS,
    key: 'medicationForms'
  }
};

type filterType = keyof typeof filters;

type MedicationFormDropdownProps = {
  filterType: filterType;
  conceptId?: string;
  medicationId?: string;
  setMedicationId: (id: string) => void;
};

type MedCombo = SearchMedication & Medication;

export const MedicationFilterDropdown = (props: MedicationFormDropdownProps) => {
  const client = usePhotonClient();
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [data, setData] = createSignal<MedCombo[]>([]);
  const [filterId, setFilterId] = createSignal<string>();
  const [selected, setSelected] = createSignal<MedCombo | undefined>();
  // eslint warning is fine, filter type won't be changing per component
  const { query, key } = filters[props.filterType];

  createEffect(() => {
    if (props?.conceptId) {
      setFilterId(undefined);
      setData([]);
    }
  });

  const medId = createMemo(() => props?.medicationId || props.conceptId);

  const fetchData = async () => {
    const { data } = await client!.apollo.query({
      query,
      variables: { medId: medId() }
    });
    setData(data[key] ?? []);
    setIsLoading(false);
  };

  createEffect(() => {
    if (medId() && !filterId()) {
      setIsLoading(true);
      fetchData();
    }
  });

  createEffect(() => {
    if (selected()?.id) {
      setFilterId(selected()!.id);
      props.setMedicationId(selected()!.id);
    }
  });

  return (
    <div class="w-full">
      <Text color="gray">
        {props.filterType.charAt(0).toUpperCase() + props.filterType.slice(1).toLowerCase()}
      </Text>

      <ComboBox setSelected={setSelected}>
        <ComboBox.Input
          placeholder={`Select a ${props.filterType.toLowerCase()}...`}
          displayValue={(filter: MedCombo) => filter?.name || filter?.form || ''}
          loading={isLoading()}
          disabled={!props?.conceptId}
          pointer
        />
        <Show when={data().length !== 0}>
          <ComboBox.Options>
            <For each={data()}>
              {(filter) => (
                <ComboBox.Option key={filter.id} value={filter}>
                  {filter?.name || filter?.form || ''}
                </ComboBox.Option>
              )}
            </For>
          </ComboBox.Options>
        </Show>
      </ComboBox>
    </div>
  );
};
