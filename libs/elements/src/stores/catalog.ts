import { PhotonClient } from '@photonhealth/sdk';
import { Catalog } from '@photonhealth/sdk/dist/types';
import { GraphQLError } from 'graphql';
import { createStore } from 'solid-js/store';
import gql from 'graphql-tag';

const CATALOG_TREATMENTS_FIELDS = gql`
  fragment CatalogTreatmentsFields on Catalog {
    id
    treatments {
      id
      name
    }
    templates {
      id
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
    }
  }
`;

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
      isLoading: false,
    },
  });

  const getCatalogs = async (client: PhotonClient) => {
    setStore('catalogs', {
      ...store.catalogs,
      isLoading: true,
    });
    const { data, errors } = await client.clinical.catalog.getCatalogs({
      fragment: {
        CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS,
      },
    });
    setStore('catalogs', {
      ...store.catalogs,
      isLoading: false,
      data: data.catalogs,
      errors: errors,
    });
  };

  return {
    store,
    actions: {
      getCatalogs,
    },
  };
};

export const CatalogStore = createCatalogStore();
