import * as zod from 'zod';
import {
  Button,
  Card,
  Collapsible,
  ComboBox,
  Input,
  InputGroup,
  NewSupervisorInput,
  Text,
  triggerToast,
  useSupervisor
} from '@photonhealth/components';
import { createEffect, createMemo, createSignal, createUniqueId, For, Show } from 'solid-js';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import { SupervisorCardFragment } from '@photonhealth/sdk/dist/clinical-api/types';

const displaySupervisor = (supervisor?: SupervisorCardFragment) =>
  supervisor?.id
    ? `${supervisor.firstName} ${supervisor.lastName}, ${supervisor.npi}`
    : 'Select a supervisor';

export const SupervisorCard = () => {
  const {
    supervisorId,
    setSupervisorId,
    supervisors,
    hasMostRecentSupervisor,
    createSupervisor
  } = useSupervisor();
  const [filteredSupervisors, setFilteredSupervisors] = createSignal<SupervisorCardFragment[]>([]);
  const currentSupervisor = createMemo(() => supervisors().find((s) => s.id === supervisorId()));

  // Keep the filtered view in sync with the upstream list (initial load + new
  // creates). User typing replaces this via the onInput handler below.
  createEffect(() => {
    setFilteredSupervisors(supervisors());
  });

  const filterSupervisors = (query: string) => {
    const q = query.toLowerCase();
    if (!q) {
      return supervisors();
    }
    return supervisors().filter((s) => displaySupervisor(s).toLowerCase().includes(q));
  };

  const handleSubmit = async (input: NewSupervisorInput) => {
    const supervisor = await createSupervisor(input);
    return supervisor !== undefined;
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
                setSupervisorId(value?.id || undefined);
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
        <NewSupervisorForm hasSupervisors={supervisors().length > 0} onSubmit={handleSubmit} />
      </div>
    </Card>
  );
};

const supervisorSchema = zod.object({
  firstName: zod
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required'),
  lastName: zod.string({ required_error: 'Last name is required' }).min(1, 'Last name is required'),
  npi: zod.coerce
    .string({ required_error: 'NPI is required' })
    .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit NPI')
});

interface NewSupervisorFormProps {
  hasSupervisors: boolean;
  onSubmit: (input: NewSupervisorInput) => Promise<boolean>;
}

const NewSupervisorForm = (props: NewSupervisorFormProps) => {
  const formId = createUniqueId();
  const [submitting, setSubmitting] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);

  const { form, errors, validate, isValid, reset } = createForm({
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        validate();
        if (!isValid()) return;
        const ok = await props.onSubmit({
          firstName: values.firstName,
          lastName: values.lastName,
          npi: String(values.npi)
        });
        if (ok) {
          setIsOpen(false);
          reset();
        } else {
          triggerToast({
            header: 'Error creating new supervisor',
            body: 'Please try again.',
            status: 'error'
          });
        }
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
          <Input name="npi" type="number" inputMode="numeric" />
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
