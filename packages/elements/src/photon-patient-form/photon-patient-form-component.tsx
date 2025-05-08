import { customElement } from 'solid-element';
import { createEffect, onCleanup, onMount, Show } from 'solid-js';
import { enums, size, string, union } from 'superstruct';
import { Spinner, PharmacySearch, Card } from '@photonhealth/components';
import { usePhoton } from '@photonhealth/components';
import { createFormStore } from '../stores/form';
import { PatientStore } from '../stores/patient';
import tailwind from '../tailwind.css?inline';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { email, empty, message, zipString, notFutureDate } from '../validators';

//Shoelace
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import { isZip } from '../utils';
import { sexes } from '../photon-sex-input/photon-sex-input-component';
import { PhotonAuthorized } from '../photon-authorized';

const getPatientAddress = (pStore: any, store: any) => {
  const patientAddress = pStore.selectedPatient.data?.address;
  if (
    store['address_zip']?.value &&
    isZip(store['address_zip']?.value) &&
    store['address_zip']?.value != patientAddress?.postalCode
  ) {
    return store['address_zip']?.value;
  }
  if (patientAddress) {
    return `${patientAddress.street1} ${patientAddress.street2 ?? ''} ${patientAddress.city}, ${
      patientAddress.state
    } ${patientAddress.postalCode}`;
  }
  return '';
};

const PatientForm = (props: { patientId: string }) => {
  let ref: any;
  const client = usePhoton();
  const { store: pStore, actions: pActions } = PatientStore;
  const { store, actions } = createFormStore({
    firstName: undefined,
    lastName: undefined,
    dateOfBirth: undefined,
    phone: undefined,
    gender: undefined,
    sex: undefined,
    email: undefined,
    address_street1: undefined,
    address_street2: undefined,
    address_city: undefined,
    address_state: undefined,
    address_zip: undefined,
    preferredPharmacy: undefined
  });
  actions.registerValidator({
    key: 'firstName',
    validator: message(size(string(), 1, Infinity), 'Please enter a first name.')
  });
  actions.registerValidator({
    key: 'lastName',
    validator: message(size(string(), 1, Infinity), 'Please enter a last name.')
  });
  actions.registerValidator({
    key: 'dateOfBirth',
    validator: message(union([notFutureDate, empty()]), 'Please enter a valid date of birth.')
  });
  actions.registerValidator({
    key: 'sex',
    validator: message(enums(sexes.map((s) => s.name)), 'Please enter Sex at Birth.')
  });
  actions.registerValidator({
    key: 'phone',
    validator: message(size(string(), 12), 'Please enter a valid mobile number.')
  });
  actions.registerValidator({
    key: 'email',
    validator: message(union([email(), empty()]), 'Please enter a valid email.')
  });
  actions.registerValidator({
    key: 'address_zip',
    validator: message(union([zipString(), empty()]), 'Please enter a valid zip code...')
  });

  onMount(() => {
    if (props.patientId) {
      pActions.getSelectedPatient(client!.getSDK(), props.patientId);
    } else {
      pActions.clearSelectedPatient();
    }
  });

  const dispatchFormUpdated = (form: any) => {
    const event = new CustomEvent('photon-form-updated', {
      composed: true,
      bubbles: true,
      detail: {
        form: form,
        actions: actions,
        selected: pStore,
        reset: () => {
          actions.reset();
          pActions.reset();
        }
      }
    });
    ref?.dispatchEvent(event);
  };

  createEffect(() => {
    if (pStore.selectedPatient.data) {
      // if it's the update patient form, prefill the form with the patient's data
      actions.updateFormValue({
        key: 'firstName',
        value: pStore.selectedPatient.data.name.first
      });
      actions.updateFormValue({
        key: 'lastName',
        value: pStore.selectedPatient.data.name.last
      });
      actions.updateFormValue({
        key: 'phone',
        value: pStore.selectedPatient.data.phone
      });
      actions.updateFormValue({
        key: 'gender',
        value: pStore.selectedPatient.data.gender
      });
      actions.updateFormValue({
        key: 'sex',
        value: pStore.selectedPatient.data.sex
      });
      actions.updateFormValue({
        key: 'email',
        value: pStore.selectedPatient.data.email
      });
      actions.updateFormValue({
        key: 'address_street1',
        value: pStore.selectedPatient.data.address?.street1
      });
      actions.updateFormValue({
        key: 'address_street2',
        value: pStore.selectedPatient.data.address?.street2
      });
      actions.updateFormValue({
        key: 'address_city',
        value: pStore.selectedPatient.data.address?.city
      });
      actions.updateFormValue({
        key: 'address_state',
        value: pStore.selectedPatient.data.address?.state
      });
      actions.updateFormValue({
        key: 'address_zip',
        value: pStore.selectedPatient.data.address?.postalCode
      });
      actions.updateFormValue({
        key: 'preferredPharmacy',
        value: pStore.selectedPatient.data.preferredPharmacies?.[0]?.id
      });
    }
  });

  createEffect(() => {
    dispatchFormUpdated(store);
  });

  onCleanup(() => {
    pActions.clearSelectedPatient();
    actions.reset();
  });

  return (
    <div class="w-full h-full relative" ref={ref}>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{photonStyles}</style>
      <Show when={pStore.selectedPatient.isLoading}>
        <div class="w-full flex justify-center">
          <Spinner color="green" />
        </div>
      </Show>

      <Show when={!pStore.selectedPatient.isLoading}>
        <PhotonAuthorized permissions={['write:patient']}>
          <div class="flex flex-col gap-8">
            <Card>
              <div>
                <p class="font-sans text-lg flex-grow">Personal</p>
                <div class="flex flex-col xs:flex-row xs:gap-4">
                  <photon-text-input
                    class="flex-grow min-w-[40%]"
                    debounce-time="0"
                    invalid={store['firstName']?.error}
                    help-text={store['firstName']?.error}
                    label="First Name"
                    required="true"
                    on:photon-input-changed={async (e: any) => {
                      actions.updateFormValue({
                        key: 'firstName',
                        value: e.detail.input
                      });
                    }}
                    value={store['firstName']?.value ?? pStore.selectedPatient.data?.name.first}
                  />
                  <photon-text-input
                    class="min-w-[48%]"
                    debounce-time="0"
                    invalid={store['lastName']?.error}
                    help-text={store['lastName']?.error}
                    label="Last Name"
                    required="true"
                    on:photon-input-changed={async (e: any) => {
                      actions.updateFormValue({
                        key: 'lastName',
                        value: e.detail.input
                      });
                    }}
                    value={store['lastName']?.value ?? pStore.selectedPatient.data?.name.last}
                  />
                </div>
                <div class="flex flex-col xs:flex-row items-center xs:gap-4">
                  <photon-datepicker
                    no-initial-date="true"
                    class="flex-grow w-full xs:min-w-[40%]"
                    invalid={store['dateOfBirth']?.error}
                    help-text={store['dateOfBirth']?.error}
                    label="Date of Birth"
                    required="true"
                    on:photon-datepicker-selected={async (e: any) => {
                      actions.updateFormValue({
                        key: 'dateOfBirth',
                        value: e.detail.date
                      });
                    }}
                    value={
                      props.patientId
                        ? pStore.selectedPatient.data?.dateOfBirth
                        : store['dateOfBirth']?.value
                    }
                  />
                  <photon-phone-input
                    class="w-full xs:min-w-[48%]"
                    invalid={store['phone']?.error}
                    help-text={store['phone']?.error}
                    label="Mobile Number"
                    required="true"
                    on:photon-phone-changed={async (e: any) => {
                      actions.updateFormValue({
                        key: 'phone',
                        value: e.detail.phone
                      });
                    }}
                    value={store['phone']?.value ?? pStore.selectedPatient.data?.phone}
                  />
                </div>
                <div class="flex flex-col xs:flex-row justify-between xs:gap-4">
                  <div class="flex-grow w-full xs:min-w-[40%]">
                    <photon-gender-input
                      label="Gender"
                      required="false"
                      help-text={store['gender']?.error}
                      invalid={store['gender']?.error !== undefined}
                      on:photon-gender-selected={(e: any) => {
                        actions.updateFormValue({
                          key: 'gender',
                          value: e.detail.gender
                        });
                      }}
                      on:photon-gender-deselected={() => {
                        actions.updateFormValue({
                          key: 'gender',
                          value: undefined
                        });
                      }}
                      selected={pStore.selectedPatient.data?.gender}
                    />
                  </div>
                  <div class="flex-grow w-full xs:min-w-[40%]">
                    <photon-sex-input
                      label="Sex at Birth"
                      required="true"
                      help-text={store['sex']?.error}
                      invalid={store['sex']?.error !== undefined}
                      on:photon-sex-selected={(e: any) => {
                        actions.updateFormValue({
                          key: 'sex',
                          value: e.detail.sex
                        });
                      }}
                      on:photon-sex-deselected={() => {
                        actions.updateFormValue({
                          key: 'sex',
                          value: undefined
                        });
                      }}
                      selected={pStore.selectedPatient.data?.sex}
                    />
                  </div>
                </div>
                <div class="mt-2">
                  <photon-text-input
                    debounce-time="0"
                    invalid={store['email']?.error}
                    help-text={store['email']?.error}
                    label="Email"
                    on:photon-input-changed={async (e: any) => {
                      actions.updateFormValue({
                        key: 'email',
                        value: e.detail.input
                      });
                    }}
                    value={store['email']?.value ?? pStore.selectedPatient.data?.email}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div>
                <p class="font-sans text-lg flex-grow">Address</p>
                <photon-text-input
                  debounce-time="0"
                  invalid={store['address_street1']?.error}
                  help-text={store['address_street1']?.error}
                  label="Street 1"
                  on:photon-input-changed={async (e: any) => {
                    actions.updateFormValue({
                      key: 'address_street1',
                      value: e.detail.input
                    });
                  }}
                  value={
                    store['address_street1']?.value ?? pStore.selectedPatient.data?.address?.street1
                  }
                />
                <photon-text-input
                  debounce-time="0"
                  invalid={store['address_street2']?.error}
                  help-text={store['address_street2']?.error}
                  label="Street 2"
                  optional={true}
                  on:photon-input-changed={async (e: any) => {
                    actions.updateFormValue({
                      key: 'address_street2',
                      value: e.detail.input
                    });
                  }}
                  value={
                    store['address_street2']?.value ?? pStore.selectedPatient.data?.address?.street2
                  }
                />
                <photon-text-input
                  debounce-time="0"
                  invalid={store['address_city']?.error}
                  help-text={store['address_city']?.error}
                  label="City"
                  on:photon-input-changed={async (e: any) => {
                    actions.updateFormValue({
                      key: 'address_city',
                      value: e.detail.input
                    });
                  }}
                  value={store['address_city']?.value ?? pStore.selectedPatient.data?.address?.city}
                />
                <div class="flex gap-4 pb-5 xs:pb-2">
                  <photon-state-input
                    class="flex-grow min-w-[40%]"
                    label="State"
                    required="false"
                    help-text={store['address_state']?.error}
                    invalid={store['address_state']?.error !== undefined}
                    on:photon-state-selected={(e: any) => {
                      actions.updateFormValue({
                        key: 'address_state',
                        value: e.detail.state
                      });
                    }}
                    selected={store['state']?.value ?? pStore.selectedPatient.data?.address?.state}
                  />
                  <photon-text-input
                    debounce-time="0"
                    class="flex-grow min-w-[40%]"
                    invalid={store['address_zip']?.error}
                    help-text={store['address_zip']?.error}
                    label="Zip Code"
                    on:photon-input-changed={async (e: any) => {
                      actions.updateFormValue({
                        key: 'address_zip',
                        value: e.detail.input
                      });
                    }}
                    value={
                      store['address_zip']?.value ??
                      pStore.selectedPatient.data?.address?.postalCode
                    }
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div>
                <p class="font-sans text-lg flex-grow">Preferred Local Pharmacy</p>
                <PharmacySearch
                  address={getPatientAddress(pStore, store)}
                  setPharmacy={(pharmacy: any) => {
                    actions.updateFormValue({
                      key: 'preferredPharmacy',
                      value: pharmacy.id
                    });
                  }}
                  patientId={props.patientId}
                  hidePreferred
                />
              </div>
            </Card>
          </div>
        </PhotonAuthorized>
      </Show>
    </div>
  );
};

customElement('photon-patient-form', { patientId: '' }, PatientForm);
