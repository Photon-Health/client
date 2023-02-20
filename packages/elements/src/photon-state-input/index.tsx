import { customElement } from 'solid-element';

//Styles
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline';
import { PhotonDropdown } from '../photon-dropdown';
import { createSignal } from 'solid-js';

type State = {
  id: string;
  name: string;
};

const states: State[] = [
  { id: '1', name: 'AL' },
  { id: '2', name: 'AK' },
  { id: '3', name: 'AZ' },
  { id: '4', name: 'AR' },
  { id: '5', name: 'CA' },
  { id: '6', name: 'CO' },
  { id: '7', name: 'CT' },
  { id: '8', name: 'DE' },
  { id: '9', name: 'DC' },
  { id: '10', name: 'FL' },
  { id: '11', name: 'GA' },
  { id: '12', name: 'HI' },
  { id: '13', name: 'ID' },
  { id: '14', name: 'IL' },
  { id: '15', name: 'IN' },
  { id: '16', name: 'IA' },
  { id: '17', name: 'KS' },
  { id: '18', name: 'KY' },
  { id: '19', name: 'LA' },
  { id: '20', name: 'ME' },
  { id: '21', name: 'MD' },
  { id: '22', name: 'MA' },
  { id: '23', name: 'MI' },
  { id: '24', name: 'MN' },
  { id: '25', name: 'MS' },
  { id: '26', name: 'MO' },
  { id: '27', name: 'MT' },
  { id: '28', name: 'NB' },
  { id: '29', name: 'NV' },
  { id: '30', name: 'NH' },
  { id: '31', name: 'NJ' },
  { id: '32', name: 'NM' },
  { id: '33', name: 'NY' },
  { id: '34', name: 'NC' },
  { id: '35', name: 'ND' },
  { id: '36', name: 'OH' },
  { id: '37', name: 'OK' },
  { id: '38', name: 'OR' },
  { id: '39', name: 'PA' },
  { id: '40', name: 'PR' },
  { id: '41', name: 'RI' },
  { id: '42', name: 'SC' },
  { id: '43', name: 'SD' },
  { id: '44', name: 'TN' },
  { id: '45', name: 'TX' },
  { id: '46', name: 'UT' },
  { id: '47', name: 'VT' },
  { id: '48', name: 'VA' },
  { id: '49', name: 'WA' },
  { id: '50', name: 'WV' },
  { id: '51', name: 'WI' },
  { id: '52', name: 'WY' }
];

customElement(
  'photon-state-input',
  {
    label: undefined,
    required: false,
    value: undefined,
    invalid: false,
    helpText: undefined,
    disabled: false,
    selected: undefined
  },
  (props: {
    label?: string;
    required: boolean;
    value?: number;
    invalid: boolean;
    helpText?: string;
    disabled: boolean;
    selected?: string;
  }) => {
    const [filter, setFilter] = createSignal<string>('');
    let ref: any;

    const dispatchStateSelected = (state: string) => {
      const event = new CustomEvent('photon-state-selected', {
        composed: true,
        bubbles: true,
        detail: {
          state: state
        }
      });
      ref?.dispatchEvent(event);
    };

    const getData = (filter: string): State[] => {
      if (filter.length === 0) {
        return states;
      }
      return states.filter((x) => x.name.toLowerCase().includes(filter.toLowerCase()));
    };

    return (
      <div
        ref={ref}
        on:photon-data-selected={(e: any) => {
          dispatchStateSelected(e.detail.data.name);
        }}
      >
        <style>{tailwind}</style>
        <style>{styles}</style>
        <PhotonDropdown
          data={getData(filter())}
          label={props.label}
          required={props.required}
          placeholder=""
          disabled={props.disabled}
          invalid={props.invalid}
          isLoading={false}
          hasMore={false}
          displayAccessor={(p) => p.name}
          showOverflow={true}
          onSearchChange={async (s: string) => {
            setFilter(s);
          }}
          onHide={async () => {
            setFilter('');
          }}
          noDataMsg={''}
          optional={false}
          helpText={props.helpText}
          selectedData={states.filter((x) => x.name === props.selected)?.[0]}
        ></PhotonDropdown>
      </div>
    );
  }
);
