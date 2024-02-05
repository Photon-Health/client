import { PhotonClient } from '@photonhealth/sdk';
import { Catalog } from '@photonhealth/sdk/dist/types';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { createStore } from 'solid-js/store';

const CATALOG_TREATMENTS_FIELDS = gql`
  fragment CatalogTreatmentsFields on Catalog {
    id
    treatments {
      id
      name
    }
    templates {
      id
      name
      daysSupply
      dispenseAsWritten
      dispenseQuantity
      dispenseUnit
      instructions
      notes
      fillsAllowed
      treatment {
        id
        name
      }
      isPrivate
    }
  }
`;

const CatalogTreatmentFieldsMap = { CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS };

const createCatalogStore = () => {
  const [store, setStore] = createStore<{
    catalogs: {
      data: Catalog[];
      errors: readonly GraphQLError[];
      isLoading: boolean;
    };
  }>({
    catalogs: {
      data: [],
      errors: [],
      isLoading: false
    }
  });

  const getCatalogs = async (client: PhotonClient) => {
    setStore('catalogs', 'isLoading', true);
    const { data, errors } = await client.clinical.catalog.getCatalogs({
      fragment: CatalogTreatmentFieldsMap
    });
    setStore('catalogs', {
      isLoading: false,
      data: data.catalogs,
      errors: errors
    });
  };

  return {
    store,
    actions: {
      getCatalogs
    }
  };
};

export const CatalogStore = createCatalogStore();
