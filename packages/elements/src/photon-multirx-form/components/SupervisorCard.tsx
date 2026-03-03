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
import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  onMount,
  Show
} from 'solid-js';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import gql from 'graphql-tag';
import { Supervisor } from '@photonhealth/sdk/dist/types';

const SupervisorsQuery = gql`
  query SupervisorsQuery {
    supervisors {
      id
      fullName
      npi
    }
  }
`;

const sortSupervisors = (supervisors: Supervisor[]) =>
  [...supervisors].sort((a, b) => a.fullName.localeCompare(b.fullName));

const displaySupervisor = (supervisor?: Supervisor) =>
  supervisor?.fullName && supervisor?.npi
    ? `${supervisor.fullName}, ${supervisor.npi}`
    : 'Select a supervisor';

interface SupervisorCardProps {
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
}

export const SupervisorCard = (props: SupervisorCardProps) => {
  const client = usePhoton();
  const [supervisors, setSupervisors] = createSignal<Supervisor[]>([]);
  const [query, setQuery] = createSignal<string>('');
  const currentSupervisor = createMemo(() =>
    supervisors().find((s) => s.id === props.store.supervisorId?.value)
  );
  const filteredSupervisors = createMemo(() => {
    const q = query().toLowerCase();
    if (!q) {
      return supervisors();
    }
    return supervisors().filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.npi.toLowerCase().includes(q) ||
        displaySupervisor(s).toLowerCase().includes(q)
    );
  });

  onMount(async () => {
    const {
      data: { supervisors: supervisorsResult }
    } = await client.sdk.apolloClinical.query({ query: SupervisorsQuery });
    setSupervisors(sortSupervisors(supervisorsResult));
    // TODO: set most recent supervisor if there is one
  });

  return (
    <Card addChildrenDivider={true} class="pb-2">
      <Text color="gray">Supervising Physician</Text>
      <div>
        <Text size="sm" color="black" class="pb-2">
          Some pharmacies require supervising physician information for this prescription. Adding it
          here can help avoid callbacks and delays.
        </Text>
        <Show when={supervisors().length > 0}>
          <InputGroup label="Supervisor">
            <ComboBox
              value={currentSupervisor()}
              setSelected={(value?: Supervisor) => {
                props.actions.updateFormValue({
                  key: 'supervisorId',
                  value: value?.id || undefined
                });
              }}
            >
              <ComboBox.Input
                onInput={(e) => setQuery(e.currentTarget.value || '')}
                displayValue={(value) => displaySupervisor(value)}
              />
              <ComboBox.Options>
                <For each={filteredSupervisors()}>
                  {(sup: Supervisor) => (
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
          onCreated={(supervisor) => {
            setSupervisors((prev) => sortSupervisors([...prev, supervisor]));
            props.actions.updateFormValue({ key: 'supervisorId', value: supervisor.id });
          }}
        />
      </div>
    </Card>
  );
};

const supervisorSchema = zod
  .object({
    supervisorFullName: zod.string().optional(),
    supervisorNpi: zod
      .union([zod.literal(''), zod.string().regex(/^[0-9]+$/, 'Enter a valid NPI')])
      .optional()
  })
  .superRefine((data, ctx) => {
    if (!!data.supervisorFullName && !data.supervisorNpi) {
      ctx.addIssue({
        code: 'custom',
        message: 'NPI is required',
        path: ['supervisorNpi']
      });
    }

    if (!data.supervisorFullName && !!data.supervisorNpi) {
      ctx.addIssue({
        code: 'custom',
        message: 'Full Name is required',
        path: ['supervisorFullName']
      });
    }
  });

const CreateSupervisorMutation = gql`
  mutation CreateSupervisorMutation($fullName: String!, $npi: String!) {
    createSupervisor(input: { fullName: $fullName, npi: $npi }) {
      id
      fullName
      npi
    }
  }
`;

type CreateSupervisorResult = { createSupervisor: Supervisor };

interface NewSupervisorFormProps {
  onCreated: (supervisor: Supervisor) => void;
}

const NewSupervisorForm = (props: NewSupervisorFormProps) => {
  const client = usePhoton();
  const formId = createUniqueId();
  const [submitting, setSubmitting] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);

  const { form, errors, validate, isValid, reset } = createForm({
    onSubmit: async (values) => {
      setSubmitting(true);
      validate();
      try {
        const { data } = await client.sdk.apolloClinical.mutate<CreateSupervisorResult>({
          mutation: CreateSupervisorMutation,
          variables: {
            fullName: values.supervisorFullName,
            npi: values.supervisorNpi
          }
        });
        if (data?.createSupervisor) {
          props.onCreated(data.createSupervisor);
          setIsOpen(false);
        }
      } catch (e) {
        triggerToast({
          header: 'Error creating supervisor',
          body: 'Please try again.',
          status: 'error'
        });
      } finally {
        setSubmitting(false);
      }
    },
    extend: validator({ schema: supervisorSchema })
  });

  createEffect(() => {
    if (!isOpen()) {
      reset();
    }
  });

  return (
    <Collapsible
      closedLabel="Add new"
      openLabel="Cancel"
      isOpen={isOpen()}
      onOpenChange={(value) => {
        setIsOpen(value);
      }}
    >
      <form ref={form} id={formId}>
        <InputGroup label="Full Name" error={errors().supervisorFullName?.[0]}>
          <Input name="supervisorFullName" onInput={validate} />
        </InputGroup>
        <InputGroup label="NPI" error={errors().supervisorNpi?.[0]}>
          <Input name="supervisorNpi" onInput={validate} />
        </InputGroup>
        <div class="flex justify-end">
          <Button
            type="submit"
            form={formId}
            variant={'secondary'}
            disabled={submitting() || !isValid()}
            loading={submitting()}
          >
            Add supervisor
          </Button>
        </div>
      </form>
    </Collapsible>
  );
};
