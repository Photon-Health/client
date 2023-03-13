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

export const createCatalogStore = (cs?: typeof createStore) => {
  // TODO when we are no longer maintaining components inside of elements, we can remove this
  // this fixes an issue where the reactivity is lost when using the store in elements
  const _createStore = cs || createStore;
  const [store, setStore] = _createStore<{
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
    setStore('catalogs', {
      ...store.catalogs,
      isLoading: true
    });
    const { data, errors } = await client.clinical.catalog.getCatalogs({
      fragment: {
        CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
      }
    });
    setStore('catalogs', {
      ...store.catalogs,
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
