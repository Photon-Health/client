import { customElement } from 'solid-element';

//Shoelace Components
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/switch/switch';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import { createEffect, createSignal, For, onMount, Show, createMemo } from 'solid-js';
import { gql } from '@apollo/client';
import { usePhotonClient } from '@photonhealth/components';
import { Medication, SearchMedication } from '@photonhealth/sdk/dist/types';
import { MedicationConceptDropdown } from './components/MedicationConceptDropdown';
import { MedicationFilterDropdown } from './components/MedicationFilterDropdown';

const GET_CATALOGS = gql`
  query GetProducts($medId: String!) {
    medicationProducts(id: $medId) {
      id
      name
      controlled
    }
  }
`;
const GET_PRODUCTS = gql`
  query GetProducts($medId: String!) {
    medicationProducts(id: $medId) {
      id
      name
      controlled
    }
  }
`;

type MedSearchProps = {
  open: boolean;
  withConcept?: boolean;
  title: string;
};

customElement(
  'photon-med-search',
  { open: false, withConcept: false, title: '' },
  (props: MedSearchProps) => {
    let ref: any;
    const client = usePhotonClient();
    const [conceptId, setConceptId] = createSignal<string>('');
    const [concept, setConcept] = createSignal<SearchMedication | undefined>(undefined);
    const [medicationId, setMedicationId] = createSignal<string>('');
    const [products, setProducts] = createSignal<(Medication | SearchMedication)[]>([]);
    const [addToCatalog, setAddToCatalog] = createSignal<boolean>(false);
    const [selectedMedication, setSelectedMedication] = createSignal<Medication | undefined>(
      undefined
    );
    const [catalogId, setCatalogId] = createSignal<string>('');
    const medId = createMemo(() => medicationId() || conceptId());

    const dispatchFormUpdated = (medication: Medication, addToCatalog: boolean) => {
      const event = new CustomEvent(
        !props?.withConcept ? 'photon-form-updated' : 'photon-med-and-concept-search',
        {
          composed: true,
          bubbles: true,
          detail: {
            medication: medication,
            addToCatalog: addToCatalog,
            catalogId: catalogId()
          }
        }
      );
      ref?.dispatchEvent(event);
    };

    onMount(async () => {
      const { data } = await client!.apollo.query({ query: GET_CATALOGS });
      if (data.catalogs.length > 0) {
        setCatalogId(data.catalogs[0].id);
      }
    });

    createEffect(() => {
      if (!props.open) {
        setConceptId('');
        setMedicationId('');
        setProducts([]);
      }
    });

    createEffect(() => {
      const searchProducts = async (id: string) => {
        const { data } = await client!.apollo.query({
          query: GET_PRODUCTS,
          variables: { medId: id }
        });

        setAddToCatalog(false);
        setSelectedMedication(undefined);
        setProducts(data.medicationProducts);
      };

      if (medId()) {
        searchProducts(medId());
      }
    });

    createEffect(() => {
      if (selectedMedication()) {
        dispatchFormUpdated(selectedMedication()!, addToCatalog());
      }
    });

    return (
      <div ref={ref}>
        <p class="font-sans text-lg text-gray-700 pb-2">{props.title}</p>
        <div class="flex flex-col xs:flex-row gap-4">
          <MedicationConceptDropdown
            conceptId={conceptId()}
            setConcept={(concept) => {
              setConceptId(concept.id);
              setConcept(concept);
              setMedicationId('');
            }}
          />
        </div>
        <div class="flex flex-col xs:flex-row gap-4">
          <MedicationFilterDropdown
            filterType="FORM"
            conceptId={conceptId()}
            medicationId={medicationId()}
            setMedicationId={setMedicationId}
          />
        </div>
        <div class="flex flex-col xs:flex-row gap-4">
          <MedicationFilterDropdown
            filterType="STRENGTH"
            conceptId={conceptId()}
            medicationId={medicationId()}
            setMedicationId={setMedicationId}
          />
        </div>
        <div class="flex flex-col xs:flex-row gap-4">
          <MedicationFilterDropdown
            filterType="ROUTE"
            conceptId={conceptId()}
            medicationId={medicationId()}
            setMedicationId={setMedicationId}
          />
        </div>
        <Show when={products().length > 0}>
          <hr class="my-8" />
          <p class="font-sans text-gray-700 pb-4">Select a medication:</p>
          <div
            on:photon-option-selected={(e: any) => {
              setSelectedMedication(e.detail.value);
            }}
          >
            <photon-radio-group>
              <Show when={props.withConcept && concept}>
                <photon-radio-card value={concept()}>{concept()?.name}</photon-radio-card>
              </Show>
              <For
                each={products()
                  .filter(
                    //We filter here in order to only display "unique" prescribable names via the UI
                    //whereas we may have multiple different NDCs for the same prescribable name
                    (value, currentIndex, self) => {
                      // We find the first occurence of an item with the same prescribable name
                      const firstOccurence = self.findIndex((p) => p.name === value.name);
                      // If the current index is the same as the first occurence, let it through
                      // otherwise filter it
                      if (currentIndex === firstOccurence) {
                        return true;
                      }
                    }
                  )
                  .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1))}
              >
                {(product) => <photon-radio-card value={product}>{product.name}</photon-radio-card>}
              </For>
            </photon-radio-group>
          </div>
          <Show when={catalogId().length > 0}>
            <photon-checkbox
              on:photon-checkbox-toggled={(e: any) => setAddToCatalog(e.detail.checked)}
              label="Add Medication to Catalog"
              disabled={!selectedMedication()}
              checked={addToCatalog()}
            />
          </Show>
        </Show>
      </div>
    );
  }
);
