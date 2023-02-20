import { Medication } from '@photonhealth/sdk/dist/types';
import { customElement } from 'solid-element';
import { usePhoton } from '../context';

customElement(
  'photon-dosage-calculator-dialog',
  {
    open: {
      value: false,
      reflect: true,
      notify: false,
      attribute: 'open',
      parse: true
    },
    medication: {
      value: undefined,
      reflect: true,
      notify: false,
      attribute: 'medication',
      parse: true
    }
  },
  (props: { open: boolean; medication?: Medication }) => {
    const client = usePhoton();
    let ref: any;

    const dispatchDoseSelected = (value: number, unit: string) => {
      const event = new CustomEvent('photon-dose-selected', {
        composed: true,
        bubbles: true,
        detail: {
          value: value,
          unit: unit
        }
      });
      ref?.dispatchEvent(event);
    };

    return (
      <div
        ref={ref}
        on:photon-dosage-selected={(e: any) => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          dispatchDoseSelected(e.detail.value, e.detail.unit);
          props.open = false;
        }}
      >
        <photon-dialog
          open={props.open}
          header={true}
          hide-footer={true}
          on:photon-dialog-canceled={() => {
            props.open = false;
          }}
          label={'Dosage Calculator'}
        >
          <photon-dosage-calculator medication={props.medication}></photon-dosage-calculator>
        </photon-dialog>
      </div>
    );
  }
);
