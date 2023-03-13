import { createDispenseUnitStore } from '@photonhealth/components';
import { createStore } from 'solid-js/store';

export const DispenseUnitStore = createDispenseUnitStore(createStore);
