import { PhotonClient } from '@photonhealth/sdk';
import { GraphQLError } from 'graphql';
import { createStore } from 'solid-js/store';
import { DispenseUnit } from '@photonhealth/sdk/dist/types';

export type StoreDispenseUnit = { id: string } & DispenseUnit;

export const createDispenseUnitStore = (cs?: typeof createStore) => {
  // TODO when we are no longer maintaining components inside of elements, we can remove this
  // this fixes an issue where the reactivity is lost when using the store in elements
  const _createStore = cs || createStore;
  const [store, setStore] = _createStore<{
    dispenseUnits: {
      data: StoreDispenseUnit[];
      errors: readonly GraphQLError[];
      isLoading: boolean;
    };
  }>({
    dispenseUnits: {
      data: [],
      errors: [],
      isLoading: false
    }
  });

  const getDispenseUnits = async (client: PhotonClient) => {
    setStore('dispenseUnits', {
      ...store.dispenseUnits,
      isLoading: true
    });
    const { data, errors } = await client.clinical.prescription.getDispenseUnits();
    setStore('dispenseUnits', {
      ...store.dispenseUnits,
      isLoading: false,
      data: data.dispenseUnits.map((x, idx) => ({
        id: idx.toString(),
        ...x
      })),
      errors: errors
    });
  };

  return {
    store,
    actions: {
      getDispenseUnits
    }
  };
};

export const DispenseUnitStore = createDispenseUnitStore();
