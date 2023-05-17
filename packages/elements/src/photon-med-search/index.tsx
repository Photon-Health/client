import { customElement } from 'solid-element';

//Shoelace Components
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/switch/switch';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import { createEffect, createSignal, For, onMount, Show, untrack } from 'solid-js';
import { usePhoton } from '../context';
import { Medication } from '@photonhealth/sdk/dist/types';
import { MedicationNameDropdown } from './components/MedicationNameDropdown';
import { MedicationStrengthDropdown } from './components/MedicationStrengthDropdown';
import { MedicationRouteDropdown } from './components/MedicationRouteDropdown';
import { MedicationFormDropdown } from './components/MedicationFormDropdown';

customElement('photon-med-search', {}, () => {
  let ref: any;
  const client = usePhoton();
  const [medicationId, setMedicationId] = createSignal<string>('');
  const [strengthId, setStrengthId] = createSignal<string>('');
  const [routeId, setRouteId] = createSignal<string>('');
  const [formId, setFormId] = createSignal<string>('');
  const [products, setProducts] = createSignal<Medication[]>([]);
  const [addToCatalog, setAddToCatalog] = createSignal<boolean>(false);
  const [selectedMedication, setSelectedMedication] = createSignal<Medication | undefined>(
    undefined
  );
  const [catalogId, setCatalogId] = createSignal<string>('');

  const dispatchFormUpdated = (medication: Medication, addToCatalog: boolean) => {
    const event = new CustomEvent('photon-form-updated', {
      composed: true,
      bubbles: true,
      detail: {
        medication: medication,
        addToCatalog: addToCatalog,
        catalogId: catalogId()
      }
    });
    ref?.dispatchEvent(event);
  };

  onMount(async () => {
    const { data } = await client!.getSDK().clinical.catalog.getCatalogs();
    if (data.catalogs.length > 0) {
      setCatalogId(data.catalogs[0].id);
    }
  });

  createEffect(() => {
    const id = formId() || routeId() || strengthId() || medicationId();
    if (id.length > 0) {
      untrack(async () => {
        const { data } = await client!.getSDK().clinical.searchMedication.getProducts({
          id: id
        });
        setAddToCatalog(false);
        setSelectedMedication(undefined);
        setProducts(data.medicationProducts);
      });
    }
  }, [medicationId, strengthId, routeId, formId]);

  createEffect(() => {
    if (selectedMedication()) {
      dispatchFormUpdated(selectedMedication()!, addToCatalog());
    }
  }, [selectedMedication, addToCatalog]);

  return (
    <div
      ref={ref}
      on:photon-name-selected={(e: any) => {
        setMedicationId(e.detail.medicationId);
      }}
      on:photon-strength-selected={(e: any) => {
        setStrengthId(e.detail.strengthId);
      }}
      on:photon-strength-deselected={(e: any) => {
        setStrengthId('');
      }}
      on:photon-route-selected={(e: any) => {
        setRouteId(e.detail.routeId);
      }}
      on:photon-route-deselected={(e: any) => {
        setRouteId('');
      }}
      on:photon-form-selected={(e: any) => {
        setFormId(e.detail.formId);
      }}
      on:photon-form-deselected={(e: any) => {
        setFormId('');
      }}
    >
      <p class="font-sans text-lg text-gray-700 text-center pb-2">Advanced Medication Search</p>
      <div class="flex flex-col xs:flex-row gap-4">
        <MedicationNameDropdown></MedicationNameDropdown>
      </div>
      <div class="flex flex-col xs:flex-row gap-4">
        <MedicationStrengthDropdown
          medicationId={medicationId()}
          disabled={medicationId().length == 0}
        ></MedicationStrengthDropdown>
        <MedicationRouteDropdown
          medicationId={strengthId()}
          disabled={strengthId().length == 0}
        ></MedicationRouteDropdown>
      </div>
      <div class="flex flex-col xs:flex-row gap-4">
        <MedicationFormDropdown
          medicationId={routeId()}
          disabled={routeId().length == 0}
        ></MedicationFormDropdown>
      </div>
      <hr class="my-8" />
      <p class="font-sans text-gray-700 pb-4">Select a medication:</p>
      <div
        on:photon-option-selected={(e: any) => {
          setSelectedMedication(e.detail.value);
        }}
      >
        <photon-radio-group>
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
        ></photon-checkbox>
      </Show>
    </div>
  );
});
