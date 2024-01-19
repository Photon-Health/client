import { Medication, SearchMedication } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal, createMemo } from 'solid-js';
import { gql } from '@apollo/client';
import { usePhotonClient } from '@photonhealth/components';
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
  const { client } = usePhotonClient();
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [data, setData] = createSignal<MedCombo[]>([]);
  const [filterId, setFilterId] = createSignal<string>();
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

  return (
    <div
      class="w-full"
      on:photon-data-selected={(e: { detail: { data: { id: string } } }) => {
        setFilterId(e.detail.data.id);
        props.setMedicationId(e.detail.data.id);
      }}
    >
      <PhotonDropdown
        data={data()}
        label={props.filterType.charAt(0).toUpperCase() + props.filterType.slice(1).toLowerCase()}
        disabled={!props?.conceptId}
        placeholder={`Select a ${props.filterType.toLowerCase()}...`}
        isLoading={isLoading()}
        hasMore={false}
        displayAccessor={(p) => p?.name || p?.form || ''}
        noDataMsg={`No ${props.filterType.toLowerCase()}s found`}
        required={false}
      />
    </div>
  );
};
