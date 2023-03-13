import { createPharmacyStore } from '@photonhealth/components';
import { createStore } from 'solid-js/store';

export const PharmacyStore = createPharmacyStore(createStore);
