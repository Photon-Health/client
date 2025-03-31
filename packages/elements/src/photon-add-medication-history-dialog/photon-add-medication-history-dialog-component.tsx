import { Treatment } from '@photonhealth/sdk/dist/types';

import { Button, Dialog, triggerToast, usePhoton } from '@photonhealth/components';
import { customElement } from 'solid-element';
import { createEffect, createSignal } from 'solid-js';
import { gql } from '@apollo/client';
import { debounce } from '@solid-primitives/scheduled';
import { boldSubstring } from '../photon-medication-search/photon-medication-search-component';

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
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import tailwind from '../tailwind.css?inline';
import styles from './styles.css?inline';

const SEARCH_TREATMENTS = gql`
  query SearchTreatments($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      id
      name
    }
  }
`;

type AddMedicationHistoryDialogProps = {
  open: boolean;
};

const Component = (props: AddMedicationHistoryDialogProps) => {
  let ref: any;

  const store = usePhoton();

  const [isLoading, setIsLoading] = createSignal(false);
  const [submitting, setSubmitting] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [searchResults, setSearchResults] = createSignal<Treatment[]>([]);
  const [medication, setMedication] = createSignal<Treatment | undefined>(undefined);

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

  const dispatchMedicationSelected = () => {
    const event = new CustomEvent('photon-medication-selected', {
      composed: true,
      bubbles: true,
      detail: { medication: medication() }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchMedicationClosed = () => {
    const event = new CustomEvent('photon-medication-closed', {
      composed: true,
      bubbles: true
    });
    ref?.dispatchEvent(event);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    dispatchMedicationSelected();
  };

  createEffect(() => {
    if (!props.open) {
      setSubmitting(false);
    }
  });

  const handleCancel = () => {
    dispatchMedicationClosed();
  };

  const handleMedicationSelected = (med: Treatment) => {
    if (med.id.startsWith('dme')) {
      triggerToast({
        header: 'Invalid Selection',
        body: 'Unable to add medical equipment to medication history.',
        status: 'error'
      });
      return;
    }

    setMedication(med);
    setSearchTerm(med.name);
  };

  return (
    <div ref={ref}>
      <style>{photonStyles}</style>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>

      <Dialog open={props.open} onClose={handleCancel} size="lg" position="center">
        <p class="text-lg font-semibold mt-0 mb-4">Add Medication History</p>
        <div class="flex items-center pb-2">
          <p class="text-gray-700 text-sm font-sans">Search for Treatment</p>
        </div>
        <sl-dropdown class="w-full p-0 dropdown">
          <sl-input
            placeholder="Type medication name"
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
                <sl-menu-item onClick={() => handleMedicationSelected(med)}>
                  {boldSubstring(med.name, searchTerm())}
                </sl-menu-item>
              ))
            ) : (
              <sl-menu-item disabled>No results found</sl-menu-item>
            )}
          </sl-menu>
        </sl-dropdown>

        <div class="mt-5 flex gap-4 justify-end">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!medication() || submitting()}
            loading={submitting()}
          >
            Select Medication
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

customElement(
  'photon-add-medication-history-dialog',
  {
    open: { value: false, reflect: true, notify: false, attribute: 'open', parse: true }
  },
  Component
);
