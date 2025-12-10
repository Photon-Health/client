import { customElement } from 'solid-element';
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { enums, size, string, union } from 'superstruct';
import { Card, Icon, PharmacySearch, Spinner, usePhoton } from '@photonhealth/components';
import { createFormStore } from '../stores/form';
import { PatientStore } from '../stores/patient';
import tailwind from '../tailwind.css?inline';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { email, empty, message, notFutureDate, zipString } from '../validators';

//Shoelace
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import { isZip } from '../utils';
import { sexes } from '../photon-sex-input';
import { PhotonAuthorized } from '../photon-authorized';
import { PharmacyOption } from '@photonhealth/components/dist/packages/components/src/systems/PharmacySearch/PharmacySearch';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

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
  const [showOptionalFields, setShowOptionalFields] = createSignal(false);
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
    validator: message(enums(sexes.map((s) => s.name.toUpperCase())), 'Please enter Sex at Birth.')
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
    key: 'address_street1',
    validator: message(size(string(), 1, Infinity), 'Please enter a valid Street 1.')
  });
  actions.registerValidator({
    key: 'address_city',
    validator: message(size(string(), 1, Infinity), 'Please enter a valid City.')
  });
  actions.registerValidator({
    key: 'address_state',
    validator: message(size(string(), 2, 2), 'Please enter a valid State.')
  });
  actions.registerValidator({
    key: 'address_zip',
    validator: message(zipString(), 'Please enter a valid zip code.')
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

  const preferredPharmacy = createMemo(() => {
    const pref = pStore.selectedPatient.data?.preferredPharmacies?.[0];
    if (!pref) return;

    const address = pref.address as PharmacyOption['address'];
    const prefOption: PharmacyOption = {
      ...pref,
      address,
      isPrevious: true,
      isPreferred: true
    };

    return prefOption;
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
                <p class="font-sans text-lg flex-grow">Patient info</p>
                <div class="flex flex-col">
                  <photon-text-input
                    class="w-full"
                    debounce-time="0"
                    invalid={store['firstName']?.error}
                    help-text={store['firstName']?.error}
                    label="First name"
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
                    class="w-full"
                    debounce-time="0"
                    invalid={store['lastName']?.error}
                    help-text={store['lastName']?.error}
                    label="Last name"
                    required="true"
                    on:photon-input-changed={async (e: any) => {
                      actions.updateFormValue({
                        key: 'lastName',
                        value: e.detail.input
                      });
                    }}
                    value={store['lastName']?.value ?? pStore.selectedPatient.data?.name.last}
                  />
                  <photon-datepicker
                    class="w-full"
                    invalid={store['dateOfBirth']?.error}
                    help-text={store['dateOfBirth']?.error}
                    label="Date of birth"
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
                    class="w-full"
                    invalid={store['phone']?.error}
                    help-text={store['phone']?.error}
                    label="Mobile number"
                    required="true"
                    on:photon-phone-changed={async (e: any) => {
                      actions.updateFormValue({
                        key: 'phone',
                        value: e.detail.phone
                      });
                    }}
                    value={store['phone']?.value ?? pStore.selectedPatient.data?.phone}
                  />
                  <photon-sex-input
                    label="Sex at birth"
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
                <p class="font-sans text-lg mt-8">Address</p>
                <photon-text-input
                  debounce-time="0"
                  invalid={store['address_street1']?.error}
                  help-text={store['address_street1']?.error}
                  label="Street 1"
                  required="true"
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
                  required="true"
                  on:photon-input-changed={async (e: any) => {
                    actions.updateFormValue({
                      key: 'address_city',
                      value: e.detail.input
                    });
                  }}
                  value={store['address_city']?.value ?? pStore.selectedPatient.data?.address?.city}
                />
                <div class="flex gap-4">
                  <photon-state-input
                    class="flex-grow min-w-[40%]"
                    label="State"
                    required="true"
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
                    label="Zip code"
                    required="true"
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
                <button
                  class="mb-4 flex items-center"
                  onClick={() => setShowOptionalFields((value) => !value)}
                >
                  <span class="font-sans text-lg">Show optional fields</span>
                  <Icon
                    name={showOptionalFields() ? 'chevronUp' : 'chevronDown'}
                    size="md"
                    class="inline-block ml-1 mt-1"
                  />
                </button>
                <Show when={showOptionalFields()}>
                  <div class="mb-4">
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
                    <photon-text-input
                      class="w-full"
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
                    <p class="font-sans text-sm m-0">Preferred pharmacy</p>
                    <PharmacySearch
                      address={getPatientAddress(pStore, store)}
                      setPharmacy={(pharmacy: any) => {
                        actions.updateFormValue({
                          key: 'preferredPharmacy',
                          value: pharmacy.id
                        });
                      }}
                      patientId={props.patientId}
                      initialValue={preferredPharmacy()}
                      hidePreferred
                    />
                  </div>
                </Show>
              </div>
            </Card>
          </div>
        </PhotonAuthorized>
      </Show>
    </div>
  );
};

customElement('photon-patient-form', { patientId: '' }, PatientForm);
