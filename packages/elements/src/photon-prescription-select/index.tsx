//Solid
import { customElement } from 'solid-element';

//Photon
import { usePhoton } from '../context';
import { PhotonDropdown } from '../photon-dropdown';

//Types
import { Prescription } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal } from 'solid-js';
import { exposeForm } from '../hooks/exposeForm';

customElement(
  'photon-prescription-select',
  {
    label: undefined,
    required: false,
    invalid: false,
    helpText: undefined,
    disabled: false,
    formName: undefined,
    patientId: undefined
  },
  (
    props: {
      label?: string;
      required: boolean;
      invalid: boolean;
      helpText?: string;
      disabled: boolean;
      formName?: string;
      patientId?: string;
    },
    options
  ) => {
    let ref: any;
    const [form, updated] = exposeForm(options.element);
    //context
    const client = usePhoton();
    const [data, setData] = createSignal<Prescription[]>([]);

    const dispatchSelected = (prescription: Prescription) => {
      const event = new CustomEvent('photon-prescription-selected', {
        composed: true,
        bubbles: true,
        detail: {
          prescription
        }
      });
      ref?.dispatchEvent(event);
    };

    createEffect(() => {
      if (updated() == 1) {
        const f = form();
        // When we use a template, update the data according to either formName or label property
        if (props.formName && f) {
          f.set(props.formName, undefined);
        }
        if (!props.formName && props.label && f) {
          f.set(props.label.toLowerCase().replace(' ', '_'), undefined);
        }
      }
    });

    createEffect(() => {
      setData(client?.clinical.prescriptions.state.prescriptions || []);
    }, [client?.clinical.prescriptions.state.prescriptions.length]);

    createEffect(() => {
      const f = form();
      if (f) {
        f.get('setLoading')(client?.clinical.prescriptions.state.isLoading);
      }
    }, [client?.clinical.prescriptions.state.isLoading]);

    options.element['reportValidity'] = () => {
      const validity: Record<string, any> = {};
      const f = form();
      if (f && props.formName) {
        validity[props.formName] = {
          valid: f.get(props.formName) != null,
          errorMessage: f.get(props.formName) != null ? undefined : 'You must select a prescription'
        };
        options.element.invalid = !validity[props.formName].valid;
        options.element.helpText = validity[props.formName].errorMessage;
      }
      if (f && !props.formName && props.label) {
        const l = props.label.toLowerCase().replace(' ', '_');
        validity[l] = {
          valid: f.get(l) != null,
          errorMessage: f.get(l) != null ? undefined : 'You must select a prescription'
        };
        options.element.invalid = !validity[l].valid;
        options.element.helpText = validity[l].errorMessage;
      }
      return validity;
    };

    return (
      <div
        ref={ref}
        on:photon-data-selected={(e: any) => {
          const f = form();
          // If we're using formName, then index by formName. Otherwise index by label property.
          if (props.formName && f) {
            f.set(props.formName, e.detail.data.id);
          }
          if (!props.formName && props.label && f) {
            f.set(props.label.toLowerCase().replace(' ', '_'), e.detail.data.id);
          }
          dispatchSelected(e.detail.data);
          if (f && props.invalid) {
            f.get('checkValidity')();
          }
          options.element.invalid = false;
          options.element.helpText = '';
        }}
      >
        <PhotonDropdown
          data={data}
          label={props.label}
          disabled={props.disabled}
          required={props.required}
          placeholder="Select a prescription..."
          invalid={props.invalid}
          isLoading={client?.clinical.prescriptions.state.isLoading || false}
          hasMore={false}
          displayAccessor={(t) => t.treatment.name}
          onSearchChange={async (s: string) => {
            if (client?.clinical.prescriptions.state.prescriptions) {
              setData(
                client?.clinical.prescriptions.state.prescriptions.filter((t) =>
                  t.treatment.name.toLowerCase().includes(s.toLowerCase())
                )
              );
            }
          }}
          onOpen={async () => {
            if (props.patientId) {
              await client?.clinical.prescriptions.getPrescriptions({
                patientId: props.patientId
              });
            }
          }}
          onHide={async () => {
            setData(client?.clinical.prescriptions.state.prescriptions || []);
          }}
          noDataMsg={
            !client?.clinical.patient.state.patient
              ? 'You must select a patient'
              : 'No prescriptions found'
          }
          helpText={props.helpText}
        ></PhotonDropdown>
      </div>
    );
  }
);
