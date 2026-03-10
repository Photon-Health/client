import * as zod from 'zod';
import {
  Button,
  Card,
  Collapsible,
  ComboBox,
  Input,
  InputGroup,
  Text,
  triggerToast,
  usePhoton
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
    } = await client.sdk.apolloClinical.query({ query: SupervisorCardQuery });

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
            <ComboBox
              value={currentSupervisor()}
              setSelected={(value?: SupervisorCardFragment) => {
                props.actions.updateFormValue({
                  key: 'supervisorId',
                  value: value?.id || undefined
                });
                setFilteredSupervisors(supervisors());
              }}
            >
              <ComboBox.Input
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

const supervisorSchema = zod.object({
  firstName: zod
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required'),
  lastName: zod.string({ required_error: 'Last name is required' }).min(1, 'Last name is required'),
  npi: zod
    .string({ required_error: 'NPI is required' })
    .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit NPI')
});

interface NewSupervisorFormProps {
  hasSupervisors: boolean;
  onCreated: (supervisor: SupervisorCardFragment) => void;
}

const NewSupervisorForm = (props: NewSupervisorFormProps) => {
  const client = usePhoton();
  const formId = createUniqueId();
  const [submitting, setSubmitting] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);

  const { form, errors, validate, isValid, reset } = createForm({
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        validate();
        if (!isValid) {
          throw new Error();
        }
        const { data } = await client.sdk.apolloClinical.mutate({
          mutation: CreateSupervisorMutation,
          variables: {
            firstName: values.firstName,
            lastName: values.lastName,
            npi: values.npi
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
    extend: validator({ schema: supervisorSchema })
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
          <Input name="npi" />
        </InputGroup>
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
