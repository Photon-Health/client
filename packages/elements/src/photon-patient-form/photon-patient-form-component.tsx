import { customElement } from 'solid-element';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { enums, size, string, union } from 'superstruct';
import type { PharmacyOption } from '@photonhealth/components';
import {
  AddressAutocompleteInput,
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
  StateSelect
} from '@photonhealth/components';
import { createFormStore } from '../stores/form';
import type { Patient } from '@photonhealth/sdk/dist/types';
import tailwind from '../tailwind.css?inline';
import photonStyles from '@photonhealth/components/dist/index.css?inline';
import { email, empty, message, notFutureDate, zipString } from '../validators';

import { isZip } from '../utils';
import { PhotonAuthorized } from '../photon-authorized';

const getPatientAddress = (store: any) => {
  const zip = store['address_zip']?.value;
  if (zip && isZip(zip)) {
    const street1 = store['address_street1']?.value ?? '';
    const street2 = store['address_street2']?.value ?? '';
    const city = store['address_city']?.value ?? '';
    const state = store['address_state']?.value ?? '';
    return `${street1} ${street2} ${city}, ${state} ${zip}`;
  }
  return '';
};

const PatientForm = (props: {
  patient?: Patient;
  loading: boolean;
  patientId: string;
  optionalPatientAddress: boolean;
}) => {
  let ref: any;
  const [showOptionalFields, setShowOptionalFields] = createSignal(false);
  const { store, actions } = createFormStore({
    firstName: props.patient?.name.first,
    lastName: props.patient?.name.last,
    dateOfBirth: props.patient?.dateOfBirth,
    phone: props.patient?.phone,
    gender: props.patient?.gender,
    sex: props.patient?.sex,
    email: props.patient?.email,
    address_street1: props.patient?.address?.street1,
    address_street2: props.patient?.address?.street2,
    address_city: props.patient?.address?.city,
    address_state: props.patient?.address?.state,
    address_zip: props.patient?.address?.postalCode,
    preferredPharmacy: props.patient?.preferredPharmacies?.[0]?.id
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

  // TODO: a customer might be listening to this event
  // so we can't quite remove it
  const dispatchFormUpdated = (store: any) => {
    const event = new CustomEvent('photon-form-updated', {
      composed: true,
      bubbles: true,
      detail: {
        form: store,
        actions: actions,
        optionalPatientAddress: props.optionalPatientAddress,
        reset: () => {
          actions.reset();
        }
      }
    });
    ref?.dispatchEvent(event);
  };

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

  const preferredPharmacy = createMemo(() => {
    const pref = props.patient?.preferredPharmacies?.[0];
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
          <AddressAutocompleteInput
            value={store['address_street1']?.value}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              actions.updateFormValue({ key: 'address_street1', value: e.currentTarget.value });
            }}
            onBlur={(e) => trackFieldInteraction('address_street1', Boolean(e.currentTarget.value))}
            onAddressSelect={(address) => {
              actions.updateFormValue({ key: 'address_street1', value: address.street1 });
              actions.updateFormValue({ key: 'address_street2', value: address.street2 });
              actions.updateFormValue({ key: 'address_city', value: address.city });
              actions.updateFormValue({ key: 'address_state', value: address.state });
              actions.updateFormValue({ key: 'address_zip', value: address.postalCode });
            }}
          />
        </InputGroup>

        <InputGroup label="Street 2" error={store['address_street2']?.error}>
          <Input
            value={store['address_street2']?.value}
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
            value={store['address_city']?.value}
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
                value={store['address_state']?.value}
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
                value={store['address_zip']?.value}
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
      <Show when={props.loading}>
        <div class="w-full flex justify-center">
          <Spinner color="green" />
        </div>
      </Show>

      <Show when={!props.loading}>
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
                      value={store['firstName']?.value}
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
                      value={store['lastName']?.value}
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
                      value={store['dateOfBirth']?.value}
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
                      value={store['phone']?.value}
                      onPhoneChange={(value) => {
                        actions.updateFormValue({ key: 'phone', value });
                      }}
                      onBlur={(e) => trackFieldInteraction('phone', Boolean(e.currentTarget.value))}
                    />
                  </InputGroup>

                  <InputGroup label="Sex at birth" error={store['sex']?.error} required>
                    <SexSelect
                      value={store['sex']?.value}
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
                  class="mb-4 mt-4 flex items-center md:!hidden"
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
                      value={store['gender']?.value}
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
                      value={store['email']?.value}
                      onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                        actions.updateFormValue({ key: 'email', value: e.currentTarget.value });
                      }}
                      onBlur={(e) => trackFieldInteraction('email', Boolean(e.currentTarget.value))}
                    />
                  </InputGroup>

                  <p class="font-sans text-sm m-0 mt-6">Preferred pharmacy</p>
                  <PharmacySearch
                    address={getPatientAddress(store)}
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

customElement(
  'photon-patient-form',
  {
    patient: undefined,
    loading: false,
    patientId: '',
    optionalPatientAddress: false
  },
  PatientForm
);
