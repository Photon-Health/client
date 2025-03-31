//Solid
import { customElement } from 'solid-element';

//Photon
import { usePhoton } from '@photonhealth/components';
import { PhotonDropdown } from '../photon-dropdown';

//Types
import { Medication, PrescriptionTemplate, Treatment } from '@photonhealth/sdk/dist/types';
import { createMemo, createSignal, onMount } from 'solid-js';
import { CatalogStore } from '../stores/catalog';

const Component = (props: {
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
          return (
            x.treatment.name.toLowerCase().includes(filter.toLowerCase()) ||
            x.name?.toLowerCase().includes(filter.toLowerCase())
          );
        } else {
          return x.name.toLowerCase().includes(filter.toLowerCase());
        }
      });
      return filtered;
    }
    return [];
  };

  const onHide = async () => setFilter('');

  const onSearchChange = async (s: string) => setFilter(s);

  const data = createMemo(() => getData(filter()));

  return (
    <div
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchTreatmentSelected(e.detail.data);
      }}
    >
      <PhotonDropdown
        data={data()}
        groups={[
          {
            label: 'Off Catalog',
            filter: (t) =>
              t &&
              typeof t === 'object' &&
              props.offCatalogOption &&
              t.id === props.offCatalogOption.id
          },
          {
            label: 'Personal Templates',
            filter: (t) => t && typeof t === 'object' && 'treatment' in t && t.isPrivate
          },
          {
            label: 'Organization Templates',
            filter: (t) => t && typeof t === 'object' && 'treatment' in t && !t.isPrivate
          },
          {
            label: 'Catalog',
            filter: (t) => t && typeof t === 'object' && 'name' in t && !('treatment' in t)
          }
        ]}
        label={props.label}
        disabled={props.disabled}
        required={props.required}
        placeholder="Select a treatment..."
        invalid={props.invalid}
        isLoading={store.catalogs.isLoading}
        hasMore={false}
        selectedData={props.selected ?? (props.offCatalogOption as Treatment)}
        displayAccessor={(t: Treatment | PrescriptionTemplate, groupAccess: boolean) => {
          if (t?.__typename !== 'PrescriptionTemplate') {
            if (groupAccess) {
              return <p class="text-sm whitespace-normal leading-snug my-1">{t.name}</p>;
            } else {
              return t?.name || '';
            }
          } else {
            if (groupAccess) {
              return (
                <div class="my-1">
                  <div class="text-sm whitespace-normal leading-snug">
                    {t?.name ? <span class="font-bold">{t.name}: </span> : ''}
                    {t.treatment.name}
                  </div>
                  <p class="text-xs text-gray-500 overflow-hidden whitespace-nowrap overflow-ellipsis">
                    QTY: {t.dispenseQuantity} {t.dispenseUnit} | Days Supply: {t.daysSupply} |{' '}
                    {/* A "-1" is needed here because in the UI we are displaying the number of refills, not fills. We get this from the templates in the catalog */}
                    Refills: {t.fillsAllowed ? t.fillsAllowed - 1 : 0} | Sig: {t.instructions}
                  </p>
                </div>
              );
            } else {
              return t.treatment.name;
            }
          }
        }}
        onSearchChange={onSearchChange}
        onHide={onHide}
        helpText={props.helpText}
      />
    </div>
  );
};
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
  Component
);
