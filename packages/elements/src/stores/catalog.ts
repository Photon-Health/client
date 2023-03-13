import { createCatalogStore } from '@photonhealth/components';
import { createStore } from 'solid-js/store';

export const CatalogStore = createCatalogStore(createStore);
