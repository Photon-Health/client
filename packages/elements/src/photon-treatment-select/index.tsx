//Solid
import { customElement } from 'solid-element';

//Photon
import { usePhoton } from '../context';
import { PhotonDropdown } from '../photon-dropdown';

//Types
import { Medication, Treatment, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import { createSignal, onMount } from 'solid-js';
import { CatalogStore } from '../stores/catalog';

customElement(
  'photon-treatment-select',
  {
    label: undefined,
    required: false,
    invalid: false,
    helpText: undefined,
    catalogId: undefined,
    disabled: false,
    formName: undefined,
    selected: undefined,
    offCatalogOption: undefined
  },
  (props: {
    label?: string;
    required: boolean;
    invalid: boolean;
    helpText?: string;
    catalogId?: string;
    disabled: boolean;
    formName?: string;
    selected?: Treatment;
    offCatalogOption?: Medication;
  }) => {
    let ref: any;
    const client = usePhoton();
    const { store, actions } = CatalogStore;
    const [filter, setFilter] = createSignal<string>('');

    onMount(async () => {
      await actions.getCatalogs(client!.getSDK());
    });

    const dispatchTreatmentSelected = (datum: Treatment | PrescriptionTemplate) => {
      const event = new CustomEvent('photon-treatment-selected', {
        composed: true,
        bubbles: true,
        detail: {
          data: datum,
          catalogId: store.catalogs.data![0]?.id || ''
        }
      });
      ref?.dispatchEvent(event);
    };

    const getData = (filter: string): (Treatment | PrescriptionTemplate)[] => {
      if (store.catalogs.data.length > 0) {
        const data = [
          ...(props.offCatalogOption ? [props.offCatalogOption as Treatment] : []),
          ...store.catalogs.data[0].templates.map((x) => x as PrescriptionTemplate),
          ...store.catalogs.data[0].treatments.map((x) => x as Treatment)
        ];
        if (filter.length === 0) {
          return data;
        }
        const filtered = data.filter((x) => {
          if ('treatment' in x) {
            return x.treatment.name.toLowerCase().includes(filter.toLowerCase());
          } else {
            return x.name.toLowerCase().includes(filter.toLowerCase());
          }
        });
        return filtered;
      }
      return [];
    };

    return (
      <div
        ref={ref}
        on:photon-data-selected={(e: any) => {
          dispatchTreatmentSelected(e.detail.data);
        }}
      >
        <PhotonDropdown
          data={getData(filter())}
          groups={[
            {
              label: 'Off Catalog',
              filter: (t: Treatment | PrescriptionTemplate) =>
                t &&
                typeof t === 'object' &&
                props.offCatalogOption &&
                t.id === props.offCatalogOption.id
            },
            {
              label: 'Templates',
              filter: (t: Treatment | PrescriptionTemplate) =>
                t && typeof t === 'object' && 'treatment' in t
            },
            {
              label: 'Catalog',
              filter: (t: Treatment | PrescriptionTemplate) =>
                t && typeof t === 'object' && 'name' in t && !('treatment' in t)
            }
          ]}
          label={props.label}
          disabled={props.disabled}
          required={props.required}
          placeholder="Select a treatment..."
          invalid={props.invalid}
          isLoading={client?.clinical.catalog.state.isLoading || false}
          hasMore={false}
          selectedData={props.selected ?? (props.offCatalogOption as Treatment)}
          displayAccessor={(t: Treatment | PrescriptionTemplate, groupAccess: boolean) =>
            t.__typename !== 'PrescriptionTemplate' ? (
              t.name
            ) : groupAccess ? (
              <>
                <p class="overflow-hidden whitespace-nowrap overflow-ellipsis">
                  {t?.name ? `${t.name}: ` : ''}
                  {t.treatment.name}
                </p>
                <p class="font-normal pl-4 overflow-hidden whitespace-nowrap overflow-ellipsis">
                  QTY: {t.dispenseQuantity} {t.dispenseUnit} | Days Supply: {t.daysSupply} |{' '}
                  {/* A "-1" is needed here because in the UI we are displaying the number of refills, not fills. We get this from the templates in the catalog */}
                  Refills: {t.fillsAllowed ? t.fillsAllowed - 1 : 0} | Sig: {t.instructions}
                </p>
              </>
            ) : (
              t.treatment.name
            )
          }
          onSearchChange={async (s: string) => setFilter(s)}
          onOpen={async () => {
            if (store.catalogs.data.length === 0) {
              await actions.getCatalogs(client!.getSDK());
            }
          }}
          onHide={async () => setFilter('')}
          noDataMsg={
            store.catalogs.data.length === 0 && !store.catalogs.isLoading
              ? 'No catalog found'
              : 'No treatments found'
          }
          helpText={props.helpText}
        />
      </div>
    );
  }
);
