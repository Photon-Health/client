import { customElement } from 'solid-element';

//Shoelace
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline';

// Types
import { Treatment } from '@photonhealth/sdk/dist/types';

import { debounce } from '@solid-primitives/scheduled';
import { gql } from '@apollo/client';

import { usePhoton } from '../context';
import { usePhotonClient, triggerToast } from '@photonhealth/components';

import { boldSubstring } from '../photon-medication-search/photon-medication-search-component';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import { createEffect, createSignal, onMount, Show } from 'solid-js';

const GET_CATALOGS = gql`
  query GetCatalogs {
    catalogs {
      id
    }
  }
`;

const SEARCH_TREATMENTS = gql`
  query SearchTreatments($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      id
      name
    }
  }
`;

const Component = () => {
  const store = usePhoton();
  const client = usePhotonClient();

  let ref: any;

  const [isLoading, setIsLoading] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [searchResults, setSearchResults] = createSignal<Treatment[]>([]);
  const [catalogId, setCatalogId] = createSignal<string>('');
  const [addToCatalog, setAddToCatalog] = createSignal<boolean>(true);

  const fetchSearchResults = debounce(async (term: string) => {
    if (!term || term.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      setIsLoading(true);
      const { data } = await store!.sdk.apolloClinical.query({
        query: SEARCH_TREATMENTS,
        variables: { filter: { term } },
        fetchPolicy: 'no-cache'
      });
      setSearchResults(data.treatments || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  createEffect(() => {
    fetchSearchResults(searchTerm());
  });

  const dispatchAdvancedMedicationSearchOpen = () => {
    const event = new CustomEvent('photon-advanced-medication-search-open', {
      composed: true,
      bubbles: true,
      detail: {
        action: 'photon-advanced-medication-search-open'
      }
    });
    ref?.dispatchEvent(event);
  };

  onMount(async () => {
    const { data } = await client!.apollo.query({ query: GET_CATALOGS });
    if (data.catalogs.length > 0) {
      setCatalogId(data.catalogs[0].id);
    }
    dispatchAdvancedMedicationSearchOpen();
  });

  const dispatchFormUpdated = (med: any) => {
    if (med.id.startsWith('dme')) {
      triggerToast({
        header: 'Invalid Selection',
        body: 'Unable to add medical equipment to medication history.',
        status: 'error'
      });
      return;
    }

    const event = new CustomEvent('photon-form-updated', {
      composed: true,
      bubbles: true,
      detail: { medication: med, catalogId: catalogId() }
    });
    setSearchTerm(med.name);
    ref?.dispatchEvent(event);
  };

  return (
    <div ref={ref}>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <sl-dropdown class="w-full">
        <sl-input
          placeholder="Search for medication..."
          autocomplete="off"
          value={searchTerm()}
          class="border border-none p-0"
          size="medium"
          clearable
          on:sl-input={(e: any) => {
            setSearchTerm(e.target.value);
          }}
          on:keydown={(e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setSearchTerm(searchTerm() + ' ');
            }
          }}
          slot="trigger"
        >
          <div
            slot="suffix"
            classList={{
              flex: true,
              hidden: !isLoading()
            }}
          >
            <sl-spinner slot="suffix" />
          </div>
        </sl-input>
        <sl-menu>
          {searchTerm()?.length < 3 ? (
            <sl-menu-item disabled>Type at least 3 characters</sl-menu-item>
          ) : searchResults().length > 0 ? (
            searchResults().map((med) => (
              <sl-menu-item onClick={() => dispatchFormUpdated(med)}>
                {boldSubstring(med.name, searchTerm())}
              </sl-menu-item>
            ))
          ) : (
            <sl-menu-item disabled>No results found</sl-menu-item>
          )}
        </sl-menu>
      </sl-dropdown>
      <Show when={catalogId().length > 0}>
        <div class="mt-2">
          <photon-checkbox
            on:photon-checkbox-toggled={(e: any) => setAddToCatalog(e.detail.checked)}
            label="Add Medication to Catalog"
            disabled={!searchTerm()}
            checked={addToCatalog()}
          />
        </div>
      </Show>
    </div>
  );
};

customElement(
  'photon-advanced-medication-search',
  {
    open: { value: false, reflect: true, notify: false, attribute: 'open', parse: true }
  },
  Component
);
