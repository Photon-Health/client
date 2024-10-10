import { PhotonClient } from '@photonhealth/sdk';
import { Catalog } from '@photonhealth/sdk/dist/types';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { createStore } from 'solid-js/store';

const CATALOG_FIELDS = gql`
  fragment CatalogFields on Catalog {
    id
  }
`;
const CatalogtFieldsMap = { CatalogFields: CATALOG_FIELDS };

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
    catalog: {
      data?: Catalog;
      errors: readonly GraphQLError[];
      isLoading: boolean;
    };
  }>({
    catalogs: {
      data: [],
      errors: [],
      isLoading: false
    },
    catalog: {
      data: undefined,
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
      fragment: CatalogtFieldsMap
    });
    setStore('catalogs', {
      ...store.catalogs,
      isLoading: false,
      data: data.catalogs,
      errors: errors
    });
  };

  const getCatalog = async (client: PhotonClient, id: string) => {
    setStore('catalog', {
      ...store.catalog,
      isLoading: true
    });
    const { data, errors } = await client.clinical.catalog.getCatalog({
      id,
      fragment: CatalogTreatmentFieldsMap
    });
    setStore('catalog', {
      ...store.catalog,
      isLoading: false,
      data: data.catalog,
      errors: errors
    });
  };

  return {
    store,
    actions: {
      getCatalogs,
      getCatalog
    }
  };
};

export const CatalogStore = createCatalogStore();
