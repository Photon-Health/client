import { PhotonClient } from '@photonhealth/sdk';
import { MedicationType } from '@photonhealth/sdk/dist/types';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { createStore } from 'solid-js/store';

export interface TreatmentOption {
  medicationId: string;
  name: string;
  ndc: string;
  type: MedicationType;
  route?: string;
  form?: string;
  strength?: string;
}

const TREATMENT_OPTIONS_FIELDS = gql`
  fragment TreatmentOptionsFields on TreatmentOption {
    medicationId
    name
    ndc
    type
    route
    form
    strength
  }
`;

const TreatmentOptionsFieldsMap = { TreatmentOptionsFields: TREATMENT_OPTIONS_FIELDS };

const createTreatmentOptionsStore = () => {
  const [store, setStore] = createStore<{
    treatmentOptions: {
      data: TreatmentOption[];
      errors: readonly GraphQLError[];
      isLoading: boolean;
    };
  }>({
    treatmentOptions: {
      data: [],
      errors: [],
      isLoading: false
    }
  });

  const getTreatmentOptions = async (client: PhotonClient) => {
    setStore('treatmentOptions', {
      ...store.treatmentOptions,
      isLoading: true
    });
    const { data, errors } = await client.clinical.catalog.getCatalogs({
      fragment: TreatmentOptionsFieldsMap
    });
    setStore('treatmentOptions', {
      ...store.treatmentOptions,
      isLoading: false,
      data: data.catalogs,
      errors: errors
    });
  };

  return {
    store,
    actions: {
      getTreatmentOptions
    }
  };
};

export const TreatmentOptionsStore = createTreatmentOptionsStore();
