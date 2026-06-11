import * as zod from 'zod';
import {
  AddressForm,
  addressSchema,
  Button,
  Card,
  Collapsible,
  ComboBox,
  Input,
  InputGroup,
  npiRegex,
  PhoneInput,
  Text,
  triggerToast,
  usePhoton,
  validateRealPhoneNumber
} from '@photonhealth/components';
import { createMemo, createSignal, createUniqueId, For, onMount, Show } from 'solid-js';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import { CreateSupervisorMutation, SupervisorCardQuery } from '@photonhealth/sdk';
import { SupervisorCardFragment } from '@photonhealth/sdk/dist/clinical-api/types';

const sortSupervisors = (supervisors: SupervisorCardFragment[]) =>
  [...supervisors].sort(
    (a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
  );

const displaySupervisor = (supervisor?: SupervisorCardFragment) =>
  supervisor?.id
    ? `${supervisor.firstName} ${supervisor.lastName}, ${supervisor.npi}`
    : 'Select a supervisor';

interface SupervisorCardProps {
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
}

export const SupervisorCard = (props: SupervisorCardProps) => {
  const client = usePhoton();
  const [supervisors, setSupervisors] = createSignal<SupervisorCardFragment[]>([]);
  const [filteredSupervisors, setFilteredSupervisors] = createSignal<SupervisorCardFragment[]>([]);
  const [hasMostRecentSupervisor, setHasMostRecentSupervisor] = createSignal<boolean>(false);
  const currentSupervisor = createMemo(() =>
    supervisors().find((s) => s.id === props.store.supervisorId?.value)
  );

  const filterSupervisors = (query: string) => {
    const q = query.toLowerCase();
    if (!q) {
      return supervisors();
    }
    const filtered = supervisors().filter((s) => displaySupervisor(s).toLowerCase().includes(q));
    return filtered;
  };

  onMount(async () => {
    const {
      data: { supervisors, mostRecentSupervisor }
    } = await client.sdk.apolloClinical.query({
      query: SupervisorCardQuery,
      // This query takes no variables so nothing indicates to the
      // client-side cache when to refetch the data
      fetchPolicy: 'network-only'
    });

    const supervisorsResult = sortSupervisors(supervisors.filter((s) => !!s));
    setSupervisors(supervisorsResult);
    setFilteredSupervisors(supervisorsResult);
    if (mostRecentSupervisor) {
      props.actions.updateFormValue({
        key: 'supervisorId',
        value: mostRecentSupervisor.id
      });
      setHasMostRecentSupervisor(true);
    }
  });

  const handleSupervisorCreated = (supervisor: SupervisorCardFragment) => {
    setSupervisors((prev) => sortSupervisors([...prev, supervisor]));
    props.actions.updateFormValue({ key: 'supervisorId', value: supervisor.id });
  };

  return (
    <Card addChildrenDivider={true} class="pb-2">
      <Text color="gray">Supervising Physician</Text>
      <div>
        <Show when={!hasMostRecentSupervisor()}>
          <Text size="sm" color="black" class="pb-2">
            Some pharmacies require supervising physician information for this prescription. Adding
            it here can help avoid callbacks and delays.
          </Text>
        </Show>
        <Show when={supervisors().length > 0}>
          <InputGroup label="Supervisor" showOptionalSubtext={true}>
            <ComboBox<SupervisorCardFragment>
              value={currentSupervisor()}
              setSelected={(value?: SupervisorCardFragment) => {
                props.actions.updateFormValue({
                  key: 'supervisorId',
                  value: value?.id || undefined
                });
                setFilteredSupervisors(supervisors());
              }}
            >
              <ComboBox.Input<SupervisorCardFragment>
                onInput={(e) =>
                  setFilteredSupervisors(filterSupervisors(e.currentTarget.value || ''))
                }
                displayValue={(value) => displaySupervisor(value)}
                showClear={true}
              />
              <ComboBox.Options>
                <For each={filteredSupervisors()}>
                  {(sup: SupervisorCardFragment) => (
                    <ComboBox.Option key={sup.id} value={sup}>
                      {displaySupervisor(sup)}
                    </ComboBox.Option>
                  )}
                </For>
              </ComboBox.Options>
            </ComboBox>
          </InputGroup>
        </Show>
        <NewSupervisorForm
          hasSupervisors={supervisors().length > 0}
          onCreated={handleSupervisorCreated}
        />
      </div>
    </Card>
  );
};

const supervisorInputSchema = zod.object({
  firstName: zod
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required'),
  lastName: zod.string({ required_error: 'Last name is required' }).min(1, 'Last name is required'),
  npi: zod.coerce
    .string({ required_error: 'NPI is required' })
    .regex(npiRegex, 'Enter a valid 10-digit NPI'),
  phone: zod
    .string({ required_error: 'Phone number is required' })
    .min(1, 'Phone number is required')
    .refine((value) => validateRealPhoneNumber(value), 'Enter a valid phone number'),
  ...addressSchema.shape
});

type SupervisorInput = zod.infer<typeof supervisorInputSchema>;

interface NewSupervisorFormProps {
  hasSupervisors: boolean;
  onCreated: (supervisor: SupervisorCardFragment) => void;
}

const NewSupervisorForm = (props: NewSupervisorFormProps) => {
  const client = usePhoton();
  const formId = createUniqueId();
  const [submitting, setSubmitting] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);

  const { form, data, errors, validate, isValid, reset, setFields } = createForm({
    onSubmit: async (values: SupervisorInput) => {
      setSubmitting(true);
      try {
        validate();
        if (!isValid()) {
          throw new Error();
        }
        const { data } = await client.sdk.apolloClinical.mutate({
          mutation: CreateSupervisorMutation,
          variables: {
            firstName: values.firstName,
            lastName: values.lastName,
            npi: String(values.npi),
            phone: values.phone,
            address: {
              street1: values.street1,
              street2: values.street2,
              city: values.city,
              state: values.state,
              postalCode: values.postalCode,
              country: 'US'
            }
          }
        });
        if (data?.createSupervisor) {
          props.onCreated(data.createSupervisor);
          setIsOpen(false);
          reset();
        }
      } catch {
        triggerToast({
          header: 'Error creating new supervisor',
          body: 'Please try again.',
          status: 'error'
        });
      } finally {
        setSubmitting(false);
      }
    },
    extend: validator({ schema: supervisorInputSchema })
  });

  return (
    <Collapsible
      closedLabel="Add new"
      openLabel="Cancel"
      alwaysOpen={!props.hasSupervisors}
      isOpen={isOpen()}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          reset();
        }
      }}
    >
      <form ref={form} id={formId}>
        <InputGroup label="First Name" error={errors().firstName?.[0]}>
          <Input name="firstName" />
        </InputGroup>
        <InputGroup label="Last Name" error={errors().lastName?.[0]}>
          <Input name="lastName" />
        </InputGroup>
        <InputGroup label="NPI" error={errors().npi?.[0]}>
          <Input name="npi" type="number" inputMode="numeric" />
        </InputGroup>
        <InputGroup label="Phone Number" error={errors().phone?.[0]}>
          <PhoneInput
            value={data().phone}
            onPhoneChange={(value) => {
              setFields('phone', value);
            }}
          />
        </InputGroup>
        <AddressForm
          data={{ street1: data().street1, state: data().state }}
          errors={{
            street1: errors().street1?.[0],
            city: errors().city?.[0],
            state: errors().state?.[0],
            postalCode: errors().postalCode?.[0]
          }}
          setAutocompleteFields={setFields}
        />
        <div class="flex justify-end">
          <Button
            type="submit"
            form={formId}
            variant={'secondary'}
            disabled={submitting()}
            loading={submitting()}
          >
            Add supervisor
          </Button>
        </div>
      </form>
    </Collapsible>
  );
};
