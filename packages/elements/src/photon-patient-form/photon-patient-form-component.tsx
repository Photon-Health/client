import { customElement } from 'solid-element';
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { enums, size, string, union } from 'superstruct';
import type { PharmacyOption } from '@photonhealth/components';
import {
  Card,
  DateInput,
  dispatchAnalyticsTrackEvent,
  GenderSelect,
  Icon,
  Input,
  InputGroup,
  PharmacySearch,
  PhoneInput,
  SEX_OPTIONS,
  SexSelect,
  Spinner,
  StateSelect,
  usePhoton
} from '@photonhealth/components';
import { createFormStore } from '../stores/form';
import { PatientStore } from '../stores/patient';
import tailwind from '../tailwind.css?inline';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { email, empty, message, notFutureDate, zipString } from '../validators';

import { isZip } from '../utils';
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

const PatientForm = (props: { patientId: string; optionalPatientAddress: boolean }) => {
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
    validator: message(notFutureDate, 'Please enter a valid date of birth.')
  });
  actions.registerValidator({
    key: 'sex',
    validator: message(enums(SEX_OPTIONS.map((o) => o.value)), 'Please enter Sex at Birth.')
  });
  actions.registerValidator({
    key: 'phone',
    validator: message(size(string(), 12), 'Please enter a valid mobile number.')
  });
  actions.registerValidator({
    key: 'email',
    validator: message(union([email(), empty()]), 'Please enter a valid email.')
  });

  // Address validators - only run when address is required.
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
        optionalPatientAddress: props.optionalPatientAddress,
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
        key: 'dateOfBirth',
        value: pStore.selectedPatient.data.dateOfBirth
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

  // Check if any address field has a value
  const hasAnyAddressField = createMemo(() => {
    return !!(
      store['address_street1']?.value ||
      store['address_street2']?.value ||
      store['address_city']?.value ||
      store['address_state']?.value ||
      store['address_zip']?.value
    );
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

  const trackFieldInteraction = (fieldName: string, hasValue: boolean) => {
    dispatchAnalyticsTrackEvent(
      {
        trackEventType: 'patient_field_interaction',
        properties: { fieldName, hasValue }
      },
      ref
    );
  };

  const AddressFields = () => {
    const isAddressRequired = createMemo(
      () => !props.optionalPatientAddress || hasAnyAddressField()
    );
    return (
      <>
        {/*Using !mt-8 because of tailwind issue in shadowDom elements */}
        {/*when not using the !important modifier*/}
        <p class="font-sans text-lg mt-4 md:!mt-8" role="heading" aria-level="3">
          Address
          <Show when={props.optionalPatientAddress && !hasAnyAddressField()}>
            <span class="text-gray-500 text-sm font-normal"> (optional)</span>
          </Show>
        </p>
        <InputGroup
          label="Street 1"
          error={store['address_street1']?.error}
          required={isAddressRequired()}
        >
          <Input
            value={store['address_street1']?.value ?? pStore.selectedPatient.data?.address?.street1}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              actions.updateFormValue({ key: 'address_street1', value: e.currentTarget.value });
            }}
            onBlur={(e) => trackFieldInteraction('address_street1', Boolean(e.currentTarget.value))}
          />
        </InputGroup>

        <InputGroup label="Street 2" error={store['address_street2']?.error}>
          <Input
            value={store['address_street2']?.value ?? pStore.selectedPatient.data?.address?.street2}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              actions.updateFormValue({ key: 'address_street2', value: e.currentTarget.value });
            }}
            onBlur={(e) => trackFieldInteraction('address_street2', Boolean(e.currentTarget.value))}
          />
        </InputGroup>

        <InputGroup
          label="City"
          error={store['address_city']?.error}
          required={isAddressRequired()}
        >
          <Input
            value={store['address_city']?.value ?? pStore.selectedPatient.data?.address?.city}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              actions.updateFormValue({ key: 'address_city', value: e.currentTarget.value });
            }}
            onBlur={(e) => trackFieldInteraction('address_city', Boolean(e.currentTarget.value))}
          />
        </InputGroup>

        <div class="flex gap-4">
          <div class="flex-grow min-w-[40%]">
            <InputGroup
              label="State"
              error={store['address_state']?.error}
              required={isAddressRequired()}
            >
              <StateSelect
                value={store['address_state']?.value ?? pStore.selectedPatient.data?.address?.state}
                onChange={(e) => {
                  actions.updateFormValue({ key: 'address_state', value: e.currentTarget.value });
                }}
                onBlur={(e) =>
                  trackFieldInteraction('address_state', Boolean(e.currentTarget.value))
                }
              />
            </InputGroup>
          </div>
          <div class="flex-grow min-w-[40%]">
            <InputGroup
              label="Zip code"
              error={store['address_zip']?.error}
              required={isAddressRequired()}
            >
              <Input
                value={
                  store['address_zip']?.value ?? pStore.selectedPatient.data?.address?.postalCode
                }
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                  actions.updateFormValue({ key: 'address_zip', value: e.currentTarget.value });
                }}
                onBlur={(e) => trackFieldInteraction('address_zip', Boolean(e.currentTarget.value))}
              />
            </InputGroup>
          </div>
        </div>
      </>
    );
  };

  return (
    <div class="w-full h-full relative" ref={ref}>
      <style>{tailwind}</style>
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
                <p class="font-sans text-lg flex-grow" role="heading" aria-level="2">
                  Patient info
                </p>
                <div class="flex flex-col">
                  <InputGroup label="First name" error={store['firstName']?.error} required>
                    <Input
                      value={store['firstName']?.value ?? pStore.selectedPatient.data?.name.first}
                      onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                        actions.updateFormValue({
                          key: 'firstName',
                          value: e.currentTarget.value
                        });
                      }}
                      onBlur={(e) =>
                        trackFieldInteraction('firstName', Boolean(e.currentTarget.value))
                      }
                    />
                  </InputGroup>

                  <InputGroup label="Last name" error={store['lastName']?.error} required>
                    <Input
                      value={store['lastName']?.value ?? pStore.selectedPatient.data?.name.last}
                      onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                        actions.updateFormValue({
                          key: 'lastName',
                          value: e.currentTarget.value
                        });
                      }}
                      onBlur={(e) =>
                        trackFieldInteraction('lastName', Boolean(e.currentTarget.value))
                      }
                    />
                  </InputGroup>

                  <InputGroup label="Date of birth" error={store['dateOfBirth']?.error} required>
                    <DateInput
                      value={
                        store['dateOfBirth']?.value ?? pStore.selectedPatient.data?.dateOfBirth
                      }
                      onDateChange={(value) => {
                        actions.updateFormValue({ key: 'dateOfBirth', value });
                      }}
                      onBlur={(e) =>
                        trackFieldInteraction('dateOfBirth', Boolean(e.currentTarget.value))
                      }
                    />
                  </InputGroup>

                  <InputGroup label="Mobile number" error={store['phone']?.error} required>
                    <PhoneInput
                      value={store['phone']?.value ?? pStore.selectedPatient.data?.phone}
                      onPhoneChange={(value) => {
                        actions.updateFormValue({ key: 'phone', value });
                      }}
                      onBlur={(e) => trackFieldInteraction('phone', Boolean(e.currentTarget.value))}
                    />
                  </InputGroup>

                  <InputGroup label="Sex at birth" error={store['sex']?.error} required>
                    <SexSelect
                      value={store['sex']?.value ?? pStore.selectedPatient.data?.sex}
                      onChange={(e) =>
                        actions.updateFormValue({ key: 'sex', value: e.currentTarget.value })
                      }
                      onBlur={() => trackFieldInteraction('sex', Boolean(store['sex']?.value))}
                    />
                  </InputGroup>
                </div>
                <Show when={!props.optionalPatientAddress}>
                  <AddressFields />
                </Show>
                <button
                  class="mb-4 mt-8 flex items-center md:!hidden"
                  aria-expanded={showOptionalFields()}
                  aria-controls="optional-fields-section"
                  onClick={() => setShowOptionalFields((value) => !value)}
                >
                  <span class="font-sans text-lg">
                    {showOptionalFields() ? 'Hide optional fields' : 'Show optional fields'}
                  </span>
                  <Icon
                    name={showOptionalFields() ? 'chevronUp' : 'chevronDown'}
                    size="md"
                    class="inline-block ml-1 mt-1"
                  />
                </button>
                <div
                  id="optional-fields-section"
                  class={`mb-4 ${showOptionalFields() ? 'block' : 'hidden md:!block'}`}
                >
                  <Show when={props.optionalPatientAddress}>
                    <AddressFields />
                  </Show>
                  <InputGroup label="Gender" error={store['gender']?.error}>
                    <GenderSelect
                      value={store['gender']?.value ?? pStore.selectedPatient.data?.gender}
                      onChange={(e) =>
                        actions.updateFormValue({ key: 'gender', value: e.currentTarget.value })
                      }
                      onBlur={() =>
                        trackFieldInteraction('gender', Boolean(store['gender']?.value))
                      }
                    />
                  </InputGroup>

                  <InputGroup label="Email" error={store['email']?.error}>
                    <Input
                      type="email"
                      value={store['email']?.value ?? pStore.selectedPatient.data?.email}
                      onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                        actions.updateFormValue({ key: 'email', value: e.currentTarget.value });
                      }}
                      onBlur={(e) => trackFieldInteraction('email', Boolean(e.currentTarget.value))}
                    />
                  </InputGroup>

                  <p class="font-sans text-sm m-0 mt-6">Preferred pharmacy</p>
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
              </div>
            </Card>
          </div>
        </PhotonAuthorized>
      </Show>
    </div>
  );
};

customElement('photon-patient-form', { patientId: '', optionalPatientAddress: false }, PatientForm);
