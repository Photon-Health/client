import { customElement } from 'solid-element';
import { createSignal, Show } from 'solid-js';
import { size, string } from 'superstruct';
import { usePhoton } from '../context';
import PhotonFormWrapper from '../photon-form-wrapper';
import { message } from '../validators';

customElement(
  'photon-update-patient-dialog',
  {
    patientId: '',
    open: {
      value: false,
      reflect: true,
      notify: false,
      attribute: 'open',
      parse: true
    }
  },
  (
    props: {
      patientId: string;
      open: boolean;
    },
    options
  ) => {
    let ref: any;
    const client = usePhoton();
    const [loading, setLoading] = createSignal(false);
    const [formStore, setFormStore] = createSignal<any>(undefined);
    const [selectedStore, setSelectedStore] = createSignal<any>(undefined);
    const [actions, setActions] = createSignal<any>(undefined);

    options.element['openDialog'] = () => {
      props.open = true;
    };

    options.element['closeDialog'] = () => {
      props.open = false;
    };

    const submitForm = async (store: any, actions: any, pStore: any) => {
      let keys: string[] = [];
      if (
        store['address_street1']?.value !== undefined ||
        store['address_city']?.value !== undefined ||
        store['address_state']?.value !== undefined ||
        store['address_zip']?.value !== undefined
      ) {
        actions.registerValidator({
          key: 'address_street1',
          validator: message(size(string(), 1, Infinity), 'Please enter a valid Street 1..')
        });
        actions.registerValidator({
          key: 'address_city',
          validator: message(size(string(), 1, Infinity), 'Please enter a valid City..')
        });
        actions.registerValidator({
          key: 'address_state',
          validator: message(size(string(), 2, 2), 'Please enter a valid State..')
        });
        keys = [
          'phone',
          'email',
          'address_zip',
          'address_street1',
          'address_city',
          'address_state'
        ];
      } else {
        const keysToRemove = ['address_street1', 'address_city', 'address_state'];
        for (const key of keysToRemove) {
          actions.unRegisterValidator(key);
        }
        keys = ['phone', 'email'];
      }
      actions.validate(keys);
      if (actions.hasErrors(keys)) {
        return true;
      }
      if (store['preferredPharmacy']!.value !== undefined) {
        const updatePatientMutation = client!.getSDK().clinical.patient.updatePatient({});
        const removePreferredPharmacyMutation = client!
          .getSDK()
          .clinical.patient.removePatientPreferredPharmacy({});
        if (pStore.selectedPatient.data?.preferredPharmacies?.length === 0) {
          await updatePatientMutation({
            variables: {
              id: props.patientId,
              preferredPharmacies: [store['preferredPharmacy']!.value]
            },
            awaitRefetchQueries: false
          });
        } else if (
          !pStore.selectedPatient.data?.preferredPharmacies
            ?.map((x: any) => x?.id)
            .filter((x: any) => x !== null)
            .includes(store['preferredPharmacy']!.value)
        ) {
          await removePreferredPharmacyMutation({
            variables: {
              patientId: props.patientId,
              pharmacyId: pStore.selectedPatient.data?.preferredPharmacies![0]!.id
            },
            awaitRefetchQueries: false
          });
          await updatePatientMutation({
            variables: {
              id: props.patientId,
              preferredPharmacies: [store['preferredPharmacy']!.value]
            },
            awaitRefetchQueries: false
          });
        }
      }
      const updatePatientMutation = client!.getSDK().clinical.patient.updatePatient({});
      await updatePatientMutation({
        variables: {
          id: props.patientId,
          name: {
            first: store['firstName']!.value,
            last: store['lastName']!.value
          },
          gender: store['gender']!.value,
          email: store['email']!.value,
          phone: store['phone']!.value,
          address:
            store['address_street1']!.value !== undefined
              ? {
                  street1: store['address_street1']!.value,
                  street2: store['address_street2']!.value,
                  city: store['address_city']!.value,
                  state: store['address_state']!.value,
                  postalCode: store['address_zip']!.value,
                  country: 'US'
                }
              : undefined
        },
        awaitRefetchQueries: false
      });
    };

    const dispatchUpdate = (patientId: string) => {
      const event = new CustomEvent('photon-patient-updated', {
        composed: true,
        bubbles: true,
        detail: {
          patientId: patientId
        }
      });
      ref?.dispatchEvent(event);
    };

    const dispatchClosed = () => {
      const event = new CustomEvent('photon-patient-closed', {
        composed: true,
        bubbles: true,
        detail: {}
      });
      ref?.dispatchEvent(event);
    };

    return (
      <div ref={ref}>
        <Show when={props.open}>
          <PhotonFormWrapper
            onClosed={() => {
              dispatchClosed();
              props.open = false;
            }}
            title="Update Patient"
            titleIconName="pencil-square"
            headerRight={
              <div class="flex space-x-2">
                <photon-button
                  size="sm"
                  disabled={loading()}
                  onClick={async () => {
                    setLoading(true);
                    const errors = await submitForm(formStore(), actions(), selectedStore());
                    if (errors) {
                      setLoading(false);
                      return;
                    }
                    dispatchUpdate(props.patientId);
                    setLoading(false);
                    actions().resetStores();
                    props.open = false;
                  }}
                >
                  Confirm
                </photon-button>
              </div>
            }
            form={
              <photon-update-patient-form
                slot="form"
                on:photon-form-updated={(e: any) => {
                  setFormStore(e.detail.form);
                  setActions(Object.assign({}, e.detail.actions, { resetStores: e.detail.reset }));
                  setSelectedStore(e.detail.selected);
                }}
                patient-id={props.patientId}
              ></photon-update-patient-form>
            }
          ></PhotonFormWrapper>
        </Show>
      </div>
    );
  }
);
