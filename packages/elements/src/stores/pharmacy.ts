// For now this is drilling down createStore into the exported component
// because something isn't working with reactivity if I don't
import { createPharmacyStore } from '@photonhealth/components';
import { createStore } from 'solid-js/store';

export const PharmacyStore = createPharmacyStore(createStore);
