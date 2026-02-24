import * as zod from 'zod';
import { Text, usePhoton } from '@photonhealth/components';
import { Address, Name } from '@photonhealth/sdk/dist/types';
import { optional, refine, string } from 'superstruct';
import { Accessor, onMount, Setter, Show } from 'solid-js';
import gql from 'graphql-tag';

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

type MeUserQueryType = {
  me: {
    name: Pick<Name, 'title'>;
    address: Pick<Address, 'state'>;
  };
};

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

export const supervisorValidatorKeys = ['supervisorFullName', 'supervisorNpi'];

interface SupervisorCardProps {
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  needsSupervisor: Accessor<boolean>;
  setNeedsSupervisor: Setter<boolean>;
}

export const SupervisorCard = (props: SupervisorCardProps) => {
  const client = usePhoton();

  const validateSupervisorFields = () => {
    const result = supervisorSchema.safeParse({
      supervisorFullName: props.store.supervisorFullName?.value,
      supervisorNpi: props.store.supervisorNpi?.value
    });
    if (result.success) {
      return {};
    }
    const errors = result.error.flatten().fieldErrors;
    const validationErrors = {
      supervisorFullName: errors.supervisorFullName?.[0],
      supervisorNpi: errors.supervisorNpi?.[0]
    };
    return { errors: validationErrors };
  };

  const supervisorValidators = {
    supervisorFullName: refine(optional(string()), 'fullNameValidation', () => {
      const result = validateSupervisorFields();
      const error = result.errors?.supervisorFullName;
      return error ? error : true;
    }),
    supervisorNpi: refine(optional(string()), 'npiValidation', () => {
      const result = validateSupervisorFields();
      const error = result.errors?.supervisorNpi;
      return error ? error : true;
    })
  };

  onMount(async () => {
    for (const [k, v] of Object.entries(supervisorValidators)) {
      props.actions.registerValidator({
        key: k,
        validator: v
      });
    }

    const {
      data: { me }
    } = await client.sdk.apolloClinical.query<MeUserQueryType>({
      query: MeUserQuery
    });
    const needsSupervisor = calculateNeedsSupervisor({
      title: me.name.title,
      state: me.address.state
    });
    props.setNeedsSupervisor(needsSupervisor);
  });

  return (
    <Show when={props.needsSupervisor()}>
      <Text size="sm" color="black" class="pb-[21px]">
        Some pharmacies require supervising physician information for this prescription. Adding it
        here can help avoid callbacks and delays.
      </Text>
      <photon-text-input
        label="Full Name"
        value={props.store.supervisorFullName?.value ?? ''}
        invalid={props.store.supervisorFullName?.error ?? false}
        help-text={props.store.supervisorFullName?.error}
        on:photon-input-changed={(e: any) =>
          props.actions.updateFormValue({
            key: 'supervisorFullName',
            value: e.detail.input
          })
        }
      />
      <photon-text-input
        label="NPI"
        value={props.store.supervisorNpi?.value ?? ''}
        invalid={props.store.supervisorNpi?.error ?? false}
        help-text={props.store.supervisorNpi?.error}
        on:photon-input-changed={(e: any) =>
          props.actions.updateFormValue({
            key: 'supervisorNpi',
            value: e.detail.input
          })
        }
      />
    </Show>
  );
};
