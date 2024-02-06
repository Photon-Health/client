import { customElement } from 'solid-element';

//Styles
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline';
import { PhotonDropdown } from '../photon-dropdown';
import { createSignal } from 'solid-js';

type Gender = {
  id: string;
  name: string;
};
const genders: Gender[] = [
  {
    id: '1',
    name: 'Male/Man'
  },
  {
    id: '2',
    name: 'Female/Woman'
  },
  {
    id: '3',
    name: 'TransMale/TransMan'
  },
  {
    id: '4',
    name: 'TransFemale/TransWoman'
  },
  {
    id: '5',
    name: 'Genderqueery/Gender nonconforming'
  },
  {
    id: '6',
    name: 'Something else'
  },
  {
    id: '7',
    name: 'Decline to answer'
  }
];

const Component = (props: {
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

  const getData = (filter: string): Gender[] => {
    if (filter.length === 0) {
      return genders;
    }
    return genders.filter((x) => x.name.toLowerCase().includes(filter.toLowerCase()));
  };

  const dispatchGenderSelected = (gender: string) => {
    const event = new CustomEvent('photon-gender-selected', {
      composed: true,
      bubbles: true,
      detail: {
        gender: gender
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchGenderDeselected = () => {
    const event = new CustomEvent('photon-gender-deselected', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  return (
    <div
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchGenderSelected(e.detail.data.name);
      }}
      on:photon-data-unselected={() => {
        dispatchGenderDeselected();
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
        displayAccessor={(p) => p?.name || ''}
        showOverflow={true}
        onSearchChange={async (s: string) => {
          setFilter(s);
        }}
        onHide={async () => {
          setFilter('');
        }}
        noDataMsg={''}
        optional={!props.required}
        helpText={props.helpText}
        selectedData={genders.filter((x) => x.name === props.selected)?.[0]}
      />
    </div>
  );
};
customElement(
  'photon-gender-input',
  {
    label: undefined,
    required: false,
    value: undefined,
    invalid: false,
    helpText: undefined,
    disabled: false,
    selected: undefined
  },
  Component
);
