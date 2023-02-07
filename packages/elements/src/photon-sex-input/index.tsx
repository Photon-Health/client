import { customElement } from 'solid-element';

//Styles
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline';
import { PhotonDropdown } from '../photon-dropdown';

type Sex = {
  id: string;
  name: string;
};

const sexes: Sex[] = [
  {
    id: '1',
    name: 'MALE',
  },
  {
    id: '2',
    name: 'FEMALE',
  },
  {
    id: '3',
    name: 'UNKNOWN',
  },
];

customElement(
  'photon-sex-input',
  {
    label: undefined,
    required: false,
    value: undefined,
    invalid: false,
    helpText: undefined,
    disabled: false,
    selected: undefined,
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
    let ref: any;

    const dispatchSexSelected = (sex: string) => {
      const event = new CustomEvent('photon-sex-selected', {
        composed: true,
        bubbles: true,
        detail: {
          sex: sex,
        },
      });
      ref?.dispatchEvent(event);
    };

    return (
      <div
        ref={ref}
        on:photon-data-selected={(e: any) => {
          dispatchSexSelected(e.detail.data.name);
        }}
      >
        <style>{tailwind}</style>
        <style>{styles}</style>
        <PhotonDropdown
          data={sexes}
          label={props.label}
          required={props.required}
          placeholder=""
          disabled={props.disabled}
          invalid={props.invalid}
          isLoading={false}
          hasMore={false}
          displayAccessor={(p) => p.name}
          showOverflow={true}
          noDataMsg={''}
          optional={false}
          helpText={props.helpText}
          selectedData={sexes.filter((x) => x.name.toUpperCase() === props.selected)?.[0]}
        ></PhotonDropdown>
      </div>
    );
  }
);
