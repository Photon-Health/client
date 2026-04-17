import { createMemo, createSignal, onMount, Show } from 'solid-js';
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
import { email, empty, message, notFutureDate, zipString } from '../validators';
import { isZip } from '../utils';
import { PhotonAuthorized } from '../photon-authorized';

const validators = {
  firstName: message(size(string(), 1, Infinity), 'Please enter a first name.'),
  lastName: message(size(string(), 1, Infinity), 'Please enter a last name.'),
  dateOfBirth: message(notFutureDate, 'Please enter a valid date of birth.'),
  sex: message(enums(SEX_OPTIONS.map((o) => o.value)), 'Please enter Sex at Birth.'),
  phone: message(size(string(), 12), 'Please enter a valid mobile number.'),
  email: message(union([email(), empty()]), 'Please enter a valid email.'),
  address_street1: message(size(string(), 1, Infinity), 'Please enter a valid Street 1.'),
  address_city: message(size(string(), 1, Infinity), 'Please enter a valid City.'),
  address_state: message(size(string(), 2, 2), 'Please enter a valid State.'),
  address_zip: message(zipString(), 'Please enter a valid zip code.')
};

export const PatientForm = (props: {
  patientId: string;
  optionalPatientAddress: boolean;
  initialPatientLoading: boolean;
  initialPreferredPharmacy?: PharmacyOption;
  store: Record<string, any>;
  actions: Record<string, (...args: any) => any>;
}) => {
  let ref: any;
  const [showOptionalFields, setShowOptionalFields] = createSignal(false);

  onMount(() => {
    for (const [k, v] of Object.entries(validators)) {
      props.actions.registerValidator({ key: k, validator: v });
    }
  });

  const trackFieldInteraction = (fieldName: string, hasValue: boolean, isOptional = false) => {
    const formName = props.patientId ? 'update_patient_form' : 'new_patient_form';
    dispatchAnalyticsTrackEvent(
      'fieldInteraction',
      { name: 'Field Interaction', formName, fieldName, hasValue, isOptional },
      ref
    );
  };

  // Check if any address field has a value
  const hasAnyAddressField = createMemo(() => {
    return !!(
      props.store['address_street1']?.value ||
      props.store['address_street2']?.value ||
      props.store['address_city']?.value ||
      props.store['address_state']?.value ||
      props.store['address_zip']?.value
    );
  });

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
          error={props.store['address_street1']?.error}
          required={isAddressRequired()}
        >
          <AddressAutocompleteInput
            value={props.store['address_street1']?.value}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              props.actions.updateFormValue({
                key: 'address_street1',
                value: e.currentTarget.value
              });
            }}
            onBlur={(e) =>
              trackFieldInteraction('address_street1', Boolean(e.currentTarget.value), true)
            }
            onAddressSelect={(address) => {
              props.actions.updateFormValue({ key: 'address_street1', value: address.street1 });
              props.actions.updateFormValue({ key: 'address_street2', value: address.street2 });
              props.actions.updateFormValue({ key: 'address_city', value: address.city });
              props.actions.updateFormValue({ key: 'address_state', value: address.state });
              props.actions.updateFormValue({ key: 'address_zip', value: address.postalCode });
            }}
          />
        </InputGroup>

        <InputGroup label="Street 2" error={props.store['address_street2']?.error}>
          <Input
            value={props.store['address_street2']?.value}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              props.actions.updateFormValue({
                key: 'address_street2',
                value: e.currentTarget.value
              });
            }}
            onBlur={(e) =>
              trackFieldInteraction('address_street2', Boolean(e.currentTarget.value), true)
            }
          />
        </InputGroup>

        <InputGroup
          label="City"
          error={props.store['address_city']?.error}
          required={isAddressRequired()}
        >
          <Input
            value={props.store['address_city']?.value}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              props.actions.updateFormValue({ key: 'address_city', value: e.currentTarget.value });
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
              error={props.store['address_state']?.error}
              required={isAddressRequired()}
            >
              <StateSelect
                value={props.store['address_state']?.value}
                onChange={(e) => {
                  props.actions.updateFormValue({
                    key: 'address_state',
                    value: e.currentTarget.value
                  });
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
              error={props.store['address_zip']?.error}
              required={isAddressRequired()}
            >
              <Input
                value={props.store['address_zip']?.value}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                  props.actions.updateFormValue({
                    key: 'address_zip',
                    value: e.currentTarget.value
                  });
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
                  <InputGroup label="First name" error={props.store['firstName']?.error} required>
                    <Input
                      value={props.store['firstName']?.value}
                      onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                        props.actions.updateFormValue({
                          key: 'firstName',
                          value: e.currentTarget.value
                        });
                      }}
                      onBlur={(e) =>
                        trackFieldInteraction('firstName', Boolean(e.currentTarget.value))
                      }
                    />
                  </InputGroup>

                  <InputGroup label="Last name" error={props.store['lastName']?.error} required>
                    <Input
                      value={props.store['lastName']?.value}
                      onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                        props.actions.updateFormValue({
                          key: 'lastName',
                          value: e.currentTarget.value
                        });
                      }}
                      onBlur={(e) =>
                        trackFieldInteraction('lastName', Boolean(e.currentTarget.value))
                      }
                    />
                  </InputGroup>

                  <InputGroup
                    label="Date of birth"
                    error={props.store['dateOfBirth']?.error}
                    required
                  >
                    <DateInput
                      value={props.store['dateOfBirth']?.value}
                      onDateChange={(value) => {
                        props.actions.updateFormValue({ key: 'dateOfBirth', value });
                      }}
                      onBlur={(e) =>
                        trackFieldInteraction('dateOfBirth', Boolean(e.currentTarget.value))
                      }
                    />
                  </InputGroup>

                  <InputGroup label="Mobile number" error={props.store['phone']?.error} required>
                    <PhoneInput
                      value={props.store['phone']?.value}
                      onPhoneChange={(value) => {
                        props.actions.updateFormValue({ key: 'phone', value });
                      }}
                      onBlur={(e) => trackFieldInteraction('phone', Boolean(e.currentTarget.value))}
                    />
                  </InputGroup>

                  <InputGroup label="Sex at birth" error={props.store['sex']?.error} required>
                    <SexSelect
                      value={props.store['sex']?.value}
                      onChange={(e) =>
                        props.actions.updateFormValue({ key: 'sex', value: e.currentTarget.value })
                      }
                      onBlur={() =>
                        trackFieldInteraction('sex', Boolean(props.store['sex']?.value))
                      }
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
                  <InputGroup label="Gender" error={props.store['gender']?.error}>
                    <GenderSelect
                      value={props.store['gender']?.value}
                      onChange={(e) =>
                        props.actions.updateFormValue({
                          key: 'gender',
                          value: e.currentTarget.value
                        })
                      }
                      onBlur={() =>
                        trackFieldInteraction('gender', Boolean(props.store['gender']?.value), true)
                      }
                    />
                  </InputGroup>

                  <InputGroup label="Email" error={props.store['email']?.error}>
                    <Input
                      type="email"
                      value={props.store['email']?.value}
                      onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                        props.actions.updateFormValue({
                          key: 'email',
                          value: e.currentTarget.value
                        });
                      }}
                      onBlur={(e) =>
                        trackFieldInteraction('email', Boolean(e.currentTarget.value), true)
                      }
                    />
                  </InputGroup>

                  <p class="font-sans text-sm m-0 mt-6">Preferred pharmacy</p>
                  <PharmacySearch
                    address={
                      isZip(props.store['address_zip']?.value)
                        ? props.store['address_zip']?.value
                        : undefined
                    }
                    setPharmacy={(pharmacy: any) => {
                      props.actions.updateFormValue({
                        key: 'preferredPharmacy',
                        value: pharmacy.id
                      });
                    }}
                    patientId={props.patientId}
                    initialValue={props.initialPreferredPharmacy}
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
