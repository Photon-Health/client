// For now this is drilling down createStore into the exported component
// because something isn't working with reactivity if I don't
import { createCatalogStore } from '@photonhealth/components';
import { createStore } from 'solid-js/store';

export const CatalogStore = createCatalogStore(createStore);
