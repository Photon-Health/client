import { createStore } from 'solid-js/store';
import { Struct, assert, StructError } from 'superstruct';

export const createFormStore = (initialValue?: Record<string, any>, cs?: typeof createStore) => {
  type StoreValue = { value: any; error?: string };
  const validators: Record<string, Array<Struct>> = {};
  if (initialValue) {
    const tmp: Record<string, any> = {};
    for (const key of Object.keys(initialValue)) {
      tmp[key] = {
        value: initialValue[key],
        error: undefined
      };
    }
    initialValue = tmp;
  }

  // TODO when we are no longer maintaining components inside of elements, we can remove this
  // this fixes an issue where the reactivity is lost when using the store in elements
  const _createStore = cs || createStore;
  const [store, setStore] = _createStore<Record<string, StoreValue | undefined>>(
    initialValue || {}
  );

  const updateFormValue = ({ key, value }: { key: string; value: any }) => {
    setStore(key, {
      value: value,
      error: undefined
    });
  };

  const hasErrors = (keys: string[]) => {
    let errors = 0;
    for (const member in store) {
      if (keys.includes(member) && store[member]?.error) {
        errors += 1;
      }
    }
    return errors > 0;
  };

  const clearKeys = (keys: string[]) => {
    for (const key of keys) {
      setStore(key, { value: undefined, error: undefined });
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

  const validate = (keys?: string[]) => {
    Object.entries(store)
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
    const keys = Object.keys(store);
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
      reset
    }
  };
};
