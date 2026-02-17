import { createForm } from '@felte/solid';
import Card from '../particles/Card';
import Input from '../particles/Input';
import InputGroup from '../particles/InputGroup';
import Text from '../particles/Text';
import * as zod from 'zod';
import { validator } from '@felte/validator-zod';

const supervisorSchema = zod.object({
  fullName: zod.string(),
  npi: zod
    .string()
    .regex(/^[0-9]+$/)
    .optional()
});

type Supervisor = zod.infer<typeof supervisorSchema>;

export const SupervisorCard = (props: { onChange: (value: Partial<Supervisor>) => void }) => {
  const { form, errors } = createForm({
    extend: validator({ schema: supervisorSchema })
  });

  return (
    <Card addChildrenDivider={true}>
      <Text color="gray">Supervising Physician</Text>
      <form ref={form} class="flex flex-col gap-y-[21px]">
        <Text size="sm" color="black">
          Some pharmacies require supervising physician information for this prescription. Adding it
          here can help avoid callbacks and delays.
        </Text>
        <InputGroup label="Full Name" error={errors().fullName?.[0]}>
          <Input
            type="text"
            name="fullName"
            onInput={(e) => props.onChange({ fullName: e.currentTarget?.value })}
          />
        </InputGroup>
        <InputGroup label="NPI" error={errors().npi?.[0]}>
          <Input
            type="text"
            name="npi"
            onInput={(e) => props.onChange({ npi: e.currentTarget?.value })}
          />
        </InputGroup>
      </form>
    </Card>
  );
};
