import { createEffect, createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { enums, size, string, union } from 'superstruct';
import {
  AddressAutocompleteInput,
  Card,
  DateInput,
  dispatchAnalyticsTrackEvent,
  GenderSelect,
  Icon,
  Input,
  InputGroup,
  PharmacyOption,
  PharmacySearch,
  PhoneInput,
  SEX_OPTIONS,
  SexSelect,
  Spinner,
  StateSelect
} from '@photonhealth/components';
import { createFormStore } from '../stores/form';
import { email, empty, message, notFutureDate, zipString } from '../validators';

import { isZip } from '../utils';
import { PhotonAuthorized } from '../photon-authorized';
import { Patient } from '@photonhealth/sdk/dist/types';

const patientToFormValues = (patient: Patient | undefined) => ({
  firstName: patient?.name.first,
  lastName: patient?.name.last,
  dateOfBirth: patient?.dateOfBirth,
  phone: patient?.phone,
  gender: patient?.gender,
  sex: patient?.sex,
  email: patient?.email,
  address_street1: patient?.address?.street1,
  address_street2: patient?.address?.street2,
  address_city: patient?.address?.city,
  address_state: patient?.address?.state,
  address_zip: patient?.address?.postalCode,
  preferredPharmacy: patient?.preferredPharmacies?.[0]?.id
});

export const PatientForm = (props: {
  patientId: string;
  optionalPatientAddress: boolean;
  initialPatient: Patient | undefined;
  initialPatientLoading: boolean;
  onUpdate: (detail: any) => void;
}) => {
  let ref: any;
  const [showOptionalFields, setShowOptionalFields] = createSignal(false);
  const { store, actions } = createFormStore(patientToFormValues(props.initialPatient));
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

  createEffect(() => {
    const values = patientToFormValues(props.initialPatient);
    for (const [key, value] of Object.entries(values)) {
      actions.updateFormValue({ key, value });
    }
  });

  // Leftover from when PatientForm was photon-patient-form-component
  // We no longer use this event internally but
  // no way of knowing if customer is listening for this event
  const dispatchFormUpdated = (form: any) => {
    const detail = {
      form: form,
      actions: actions,
      reset: () => {
        actions.reset();
      }
    };
    const event = new CustomEvent('photon-form-updated', {
      composed: true,
      bubbles: true,
      detail
    });
    ref?.dispatchEvent(event);

    props.onUpdate(detail);
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

  onCleanup(() => {
    actions.reset();
  });

  const initialPreferredPharmacy = createMemo(() => {
    const pref = props.initialPatient?.preferredPharmacies?.[0];
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

  const formName = props.patientId ? 'update_patient_form' : 'new_patient_form';

  const trackFieldInteraction = (fieldName: string, hasValue: boolean, isOptional = false) => {
    dispatchAnalyticsTrackEvent(
      'fieldInteraction',
      { name: 'Field Interaction', formName, fieldName, hasValue, isOptional },
      ref
    );
  };

  const isAddressRequired = createMemo(() => !props.optionalPatientAddress || hasAnyAddressField());

  const AddressFields = () => {
    return (
      <>
        {/*Using !mt-8 because of tailwind issue in shadowDom elements */}
        {/*when not using the !important modifier*/}
        <p class="font-sans text-lg mt-4 md:!mt-8" role="heading" aria-level="3">
          Address
          <Show when={!isAddressRequired()}>
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
            onBlur={(e) =>
              trackFieldInteraction('address_street1', Boolean(e.currentTarget.value), true)
            }
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
            onBlur={(e) =>
              trackFieldInteraction('address_street2', Boolean(e.currentTarget.value), true)
            }
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
            onBlur={(e) =>
              trackFieldInteraction('address_city', Boolean(e.currentTarget.value), true)
            }
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
                  trackFieldInteraction('address_state', Boolean(e.currentTarget.value), true)
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
                onBlur={(e) =>
                  trackFieldInteraction('address_zip', Boolean(e.currentTarget.value), true)
                }
              />
            </InputGroup>
          </div>
        </div>
      </>
    );
  };

  return (
    <div class="w-full h-full relative" ref={ref}>
      <Show when={props.initialPatientLoading}>
        <div class="w-full flex justify-center">
          <Spinner color="green" />
        </div>
      </Show>

      <Show when={!props.initialPatientLoading}>
        <PhotonAuthorized permissions={['write:patient']}>
          <div class="flex flex-col gap-8">
            <Card>
              <div>
                <p class="font-sans text-lg flex-grow my-2" role="heading" aria-level="2">
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
                      value={store['gender']?.value}
                      onChange={(e) =>
                        actions.updateFormValue({ key: 'gender', value: e.currentTarget.value })
                      }
                      onBlur={() =>
                        trackFieldInteraction('gender', Boolean(store['gender']?.value), true)
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
                      onBlur={(e) =>
                        trackFieldInteraction('email', Boolean(e.currentTarget.value), true)
                      }
                    />
                  </InputGroup>

                  <p class="font-sans text-sm m-0 mt-6">Preferred pharmacy</p>
                  <PharmacySearch
                    address={
                      isZip(store['address_zip']?.value) ? store['address_zip']?.value : undefined
                    }
                    setPharmacy={(pharmacy: any) => {
                      actions.updateFormValue({
                        key: 'preferredPharmacy',
                        value: pharmacy.id
                      });
                    }}
                    patientId={props.patientId}
                    initialValue={initialPreferredPharmacy()}
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
