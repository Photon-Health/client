import { createStore, Store } from 'solid-js/store';
import { assert, Struct, StructError } from 'superstruct';
import {
  Address,
  FulfillmentType,
  Patient,
  Pharmacy,
  Treatment
} from '@photonhealth/sdk/dist/types';
import { DraftPrescription } from '@photonhealth/components';

export type FormError = { key: string; error: string };

interface StoreValue<T> {
  value?: T;
  error?: string;
}

interface RequiredStoreValue<T> {
  value: T;
  error?: string;
}

type PrescribeFormStore = {
  dispenseAsWritten: StoreValue<boolean>;
  patient: StoreValue<Patient>;
  treatment: StoreValue<Treatment>;
  draftPrescriptions: RequiredStoreValue<DraftPrescription[]>;
  pharmacy: StoreValue<Pharmacy>;
  errors: StoreValue<Error[]>;
  address: StoreValue<Address>;
  fulfillmentType: StoreValue<FulfillmentType>;
  updatePreferredPharmacy: StoreValue<boolean>;
  catalogId: StoreValue<string>;
};
export type PrescribeFormStoreKey = keyof PrescribeFormStore;
export type PrescribeFormStoreWrapper = {
  store: PrescribeFormStore;
  actions: {
    updateFormValue: (params: { key: PrescribeFormStoreKey; value: any }) => void;
    clearKeys: (keys: PrescribeFormStoreKey[]) => void;
    registerValidator: (params: {
      key: PrescribeFormStoreKey;
      validator: Struct<any, any>;
    }) => void;
    unRegisterValidator: (key: PrescribeFormStoreKey) => void;
    validate: (keys?: PrescribeFormStoreKey[]) => void;
    hasErrors: (keys: PrescribeFormStoreKey[]) => boolean;
    getErrors: (keys: PrescribeFormStoreKey[]) => FormError[];
    reset: () => void;
  };
};

type CreatePrescribeFormStore = () => PrescribeFormStoreWrapper;

function getTypedEntries(store: Store<PrescribeFormStore>) {
  return Object.entries(store) as Array<
    [PrescribeFormStoreKey, PrescribeFormStore[PrescribeFormStoreKey]]
  >;
}

export const createPrescribeFormStore: CreatePrescribeFormStore = () => {
  const validators: Record<string, Array<Struct>> = {};
  const initialValue: PrescribeFormStore = {
    dispenseAsWritten: {
      value: false,
      error: undefined
    },
    patient: {
      value: undefined,
      error: undefined
    },
    treatment: {
      value: undefined,
      error: undefined
    },
    draftPrescriptions: {
      value: [],
      error: undefined
    },
    pharmacy: {
      value: undefined,
      error: undefined
    },
    errors: {
      value: [],
      error: undefined
    },
    address: {
      value: undefined,
      error: undefined
    },
    fulfillmentType: {
      value: undefined,
      error: undefined
    },
    updatePreferredPharmacy: {
      value: undefined,
      error: undefined
    },
    catalogId: {
      value: undefined,
      error: undefined
    }
  };

  const [store, setStore] = createStore<PrescribeFormStore>(initialValue);

  const updateFormValue = ({ key, value }: { key: PrescribeFormStoreKey; value: any }) => {
    setStore(key, {
      value: value,
      error: undefined
    });
  };

  const hasErrors = (keys: PrescribeFormStoreKey[]) => {
    let errors = 0;
    for (const member of getKeys(store)) {
      if (keys.includes(member) && store[member]?.error) {
        errors += 1;
      }
    }
    return errors > 0;
  };

  const getErrors = (keys: PrescribeFormStoreKey[]): FormError[] => {
    let errors: FormError[] = [];
    for (const member of getKeys(store)) {
      if (keys.includes(member) && store[member]?.error) {
        errors = [...errors, { key: member, error: store[member]?.error ?? '' }];
      }
    }
    return errors;
  };

  const clearKeys = (keys: PrescribeFormStoreKey[]) => {
    for (const key of keys) {
      setStore(key, {
        value: undefined,
        error: undefined
      });
    }
  };

  const registerValidator = ({ key, validator }: { key: string; validator: Struct<any, any> }) => {
    if (key in validators) {
      validators[key] = [...validators[key], validator];
      return;
    }
    validators[key] = [validator];
  };

  const unRegisterValidator = (key: string) => {
    delete validators[key];
  };

  const validate = (keys?: PrescribeFormStoreKey[]) => {
    const entries = getTypedEntries(store);
    entries
      .filter(([k]) => (keys ? keys.includes(k) : true))
      .forEach(([k, v]) => {
        if (validators[k]) {
          validators[k].forEach((validator) => {
            try {
              assert(v?.value, validator);
            } catch (err) {
              for (const failure of (err as StructError).failures()) {
                setStore(k, {
                  value: v?.value,
                  error: failure.message
                });
              }
            }
          });
        }
      });
  };

  const reset = () => {
    const keys = getKeys(store);
    clearKeys(keys);
    const validatorKeys = Object.keys(validators);
    for (const key of validatorKeys) {
      delete validators[key];
    }
  };

  return {
    store,
    actions: {
      updateFormValue,
      clearKeys,
      registerValidator,
      unRegisterValidator,
      validate,
      hasErrors,
      getErrors,
      reset
    }
  };
};

function getKeys(store: Store<PrescribeFormStore>) {
  return Object.keys(store) as PrescribeFormStoreKey[];
}
