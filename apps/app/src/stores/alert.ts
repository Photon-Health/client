import { persistentAtom } from '@nanostores/persistent';
import { action, computed } from 'nanostores';
import { ulid } from 'ulid';
import { titleCase } from '../utils';

export const alertStore = persistentAtom<
  Array<{
    id: string;
    message: string;
    type: 'info' | 'error' | 'success';
    timeoutValue: number;
    timeout: ReturnType<typeof setTimeout>;
    created: number;
    metadata: Record<string, any>;
  }>
>('alerts', [], {
  encode: JSON.stringify,
  decode: JSON.parse
});

export const hiddenCount = computed(alertStore, (list) => list.length - 2);

export const dismissAlert = action(alertStore, 'dismissAlert', (store, id) => {
  const errors = store.get();
  store.set(errors.filter((x) => x.id !== id));
});

export const addAlert = action(
  alertStore,
  'addAlert',
  (
    store,
    {
      message,
      type,
      timeout,
      metadata
    }: {
      message: string;
      type?: 'info' | 'error' | 'success';
      timeout?: number;
      metadata?: Record<string, any>;
    }
  ) => {
    const newId = ulid();
    const errors = store.get();
    errors.unshift({
      id: newId,
      message: titleCase(message),
      type: type || 'info',
      timeoutValue: timeout || 30000,
      timeout: setTimeout(() => {
        dismissAlert(newId);
      }, timeout || 30000),
      created: new Date().getTime(),
      metadata: metadata || {}
    });
    store.set(errors);
  }
);
