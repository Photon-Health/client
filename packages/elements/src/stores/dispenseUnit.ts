import { PhotonClient } from '@photonhealth/sdk';
import { GraphQLFormattedError } from 'graphql';
import { createStore } from 'solid-js/store';
import { DispenseUnit } from '@photonhealth/sdk/dist/types';

export type StoreDispenseUnit = { id: string } & DispenseUnit;

const createDispenseUnitStore = () => {
  const [store, setStore] = createStore<{
    dispenseUnits: {
      data: StoreDispenseUnit[];
      errors: readonly GraphQLFormattedError[];
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
