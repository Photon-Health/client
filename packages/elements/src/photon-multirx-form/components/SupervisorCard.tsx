import * as zod from 'zod';
import { Card, Input, InputGroup, Text, usePhoton } from '@photonhealth/components';
import { Address, Name } from '@photonhealth/sdk/dist/types';
import { createEffect, onMount, Setter, Show } from 'solid-js';
import gql from 'graphql-tag';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';

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

const MeUserQuery = gql`
  query MeUserQuery {
    me {
      name {
        title
      }
      address {
        state
      }
    }
  }
`;

type MeUserQueryVariables = {
  me: {
    name: Pick<Name, 'title'>;
    address: Pick<Address, 'state'>;
  };
};

// const SupervisorsQuery = gql`
//   query SupervisorsQuery {
//     supervisors {
//       id
//       fullName
//       npi
//     }
//   }
// `;

// type SupervisorsQueryResult = {supervisors: Array<Pick<Supervisor>>}

const calculateNeedsSupervisor = ({
  title,
  state
}: {
  title: Name['title'];
  state: Address['state'];
}) =>
  !!title &&
  ['NP', 'PA'].includes(title) &&
  ['CA', 'FL', 'GA', 'MI', 'MO', 'NC', 'OK', 'SC', 'TN', 'TX', 'VA'].includes(state.toUpperCase());

interface SupervisorCardProps {
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  needsSupervisor: boolean;
  setNeedsSupervisor: Setter<boolean>;
}

export const SupervisorCard = (props: SupervisorCardProps) => {
  const client = usePhoton();

  const { form, data, errors, validate } = createForm({
    onSubmit: () => {
      // form only handles validation and state management
    },
    extend: validator({ schema: supervisorSchema })
  });

  onMount(async () => {
    const {
      data: { me }
    } = await client.sdk.apolloClinical.query<MeUserQueryVariables>({
      query: MeUserQuery
    });
    const needsSupervisor = calculateNeedsSupervisor({
      title: me.name.title,
      state: me.address.state
    });
    props.setNeedsSupervisor(needsSupervisor);
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
    <Show when={props.needsSupervisor}>
      <Card addChildrenDivider={true} class="pb-2">
        <Text color="gray">Supervising Physician</Text>
        <form ref={form}>
          <Text size="sm" color="black">
            Some pharmacies require supervising physician information for this prescription. Adding
            it here can help avoid callbacks and delays.
          </Text>
          <InputGroup label="Full Name" error={errors().supervisorFullName?.[0]}>
            <Input name="supervisorFullName" onInput={validate} />
          </InputGroup>
          <InputGroup label="NPI" error={errors().supervisorNpi?.[0]}>
            <Input name="supervisorNpi" onInput={validate} />
          </InputGroup>
        </form>
      </Card>
    </Show>
  );
};
