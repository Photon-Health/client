import * as zod from 'zod';
import { Card, ComboBox, Input, InputGroup, Text, usePhoton } from '@photonhealth/components';
import { createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import gql from 'graphql-tag';

type Supervisor = {
  id: string;
  fullName: string;
  npi: string;
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
        message: 'NPI is required when Full Name is filled out',
        path: ['supervisorNpi']
      });
    }

    if (!data.supervisorFullName && !!data.supervisorNpi) {
      ctx.addIssue({
        code: 'custom',
        message: 'Full Name is required when NPI is filled out',
        path: ['supervisorFullName']
      });
    }
  });

export const supervisorValidatorKeys = ['supervisorFullName', 'supervisorNpi'];

const SupervisorsQuery = gql`
  query SupervisorsQuery {
    supervisors {
      id
      fullName
      npi
    }
  }
`;

const displaySupervisor = (supervisor?: Supervisor) =>
  `${supervisor?.fullName}, ${supervisor?.npi}`;

interface SupervisorCardProps {
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
}

export const SupervisorCard = (props: SupervisorCardProps) => {
  const client = usePhoton();
  const [supervisors, setSupervisors] = createSignal<Supervisor[]>([]);
  const supervisorMap = createMemo(() => Object.fromEntries(supervisors().map((s) => [s.id, s])));

  const { form, data, errors, validate } = createForm({
    onSubmit: () => {
      // form only handles validation and state management
    },
    extend: validator({ schema: supervisorSchema })
  });

  onMount(async () => {
    const {
      data: { supervisors: supervisorsResult }
    } = await client.sdk.apolloClinical.query({ query: SupervisorsQuery });

    setSupervisors(supervisorsResult);
    // TODO: use most recent supervisor instead
    props.actions.updateFormValue({
      key: 'supervisorId',
      value: supervisorsResult[0]?.id
    });
  });

  createEffect(() => {
    props.actions.updateFormValue({
      key: 'supervisorFullName',
      value: data().supervisorFullName
    });
    props.actions.updateFormError({
      key: 'supervisorFullName',
      error: errors().supervisorFullName?.[0]
    });

    props.actions.updateFormValue({
      key: 'supervisorNpi',
      value: data().supervisorNpi
    });
    props.actions.updateFormError({
      key: 'supervisorNpi',
      error: errors().supervisorNpi?.[0]
    });
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
              value={supervisorMap()[props.store.supervisorId?.value]}
              setSelected={(value: Supervisor) => {
                props.actions.updateFormValue({
                  key: 'supervisorId',
                  value: value.id
                });
              }}
            >
              <ComboBox.Input displayValue={(value) => displaySupervisor(value)} />
              <ComboBox.Options>
                <For each={supervisors()}>
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
        <form ref={form}>
          <InputGroup label="Full Name" error={errors().supervisorFullName?.[0]}>
            <Input name="supervisorFullName" onInput={validate} />
          </InputGroup>
          <InputGroup label="NPI" error={errors().supervisorNpi?.[0]}>
            <Input name="supervisorNpi" onInput={validate} />
          </InputGroup>
        </form>
      </div>
    </Card>
  );
};
