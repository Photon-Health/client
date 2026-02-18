import Card from '../particles/Card';
import Input from '../particles/Input';
import InputGroup from '../particles/InputGroup';
import Text from '../particles/Text';
import { refine, string, optional } from 'superstruct';
import { onMount } from 'solid-js';
import * as zod from 'zod';

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

export const SupervisorCard = (props: {
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
}) => {
  const validateFields = () => {
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

  onMount(() => {
    // This component is part of PrescribeWorkflow, which uses superstruct for validation
    // but superstruct doesn't have the ability to validate based on other schema fields.
    // We can use superstruct `refine` as an escape hatch to zod-based validation.
    const validators = {
      supervisorFullName: refine(optional(string()), 'fullNameValidation', () => {
        const result = validateFields();
        const error = result.errors?.supervisorFullName;
        return error ? error : true;
      }),
      supervisorNpi: refine(optional(string()), 'npiValidation', () => {
        const result = validateFields();
        const error = result.errors?.supervisorNpi;
        return error ? error : true;
      })
    };

    for (const [k, v] of Object.entries(validators)) {
      props.actions.registerValidator({
        key: k,
        validator: v
      });
    }
  });

  const handleInput = (key: string, value: string) => {
    props.actions.updateFormValue({
      key,
      value
    });
  };

  return (
    <Card addChildrenDivider={true}>
      <Text color="gray">Supervising Physician</Text>
      <div class="flex flex-col gap-y-[21px]">
        <Text size="sm" color="black">
          Some pharmacies require supervising physician information for this prescription. Adding it
          here can help avoid callbacks and delays.
        </Text>
        <InputGroup label="Full Name" error={props.store.supervisorFullName?.error}>
          <Input
            type="text"
            name="supervisorFullName"
            value={props.store.supervisorFullName?.value}
            onInput={(e) => handleInput('supervisorFullName', e.currentTarget?.value)}
          />
        </InputGroup>
        <InputGroup label="NPI" error={props.store.supervisorNpi?.error}>
          <Input
            type="text"
            name="supervisorNpi"
            value={props.store.supervisorNpi?.value}
            onInput={(e) => handleInput('supervisorNpi', e.currentTarget?.value)}
          />
        </InputGroup>
      </div>
    </Card>
  );
};
