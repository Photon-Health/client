import { createForm } from '@felte/solid';
import Input from '../../particles/Input';
import InputGroup from '../../particles/InputGroup';
import { states } from './states';
import ListSelect from '../../particles/ListBox';
import Card from '../../particles/Card';
import Text from '../../particles/Text';
import Button from '../../particles/Button';

export default function AddressForm() {
  const { form } = createForm({
    onSubmit: async (values) => {
      /* call to an api */
      console.log(values);
    }
  });

  return (
    <Card>
      <div class="flex items-center justify-between">
        <Text color="gray">Patient Address</Text>
        <Button>Save Address</Button>
      </div>
      <form ref={form}>
        <InputGroup label="Address Line 1 *" subLabel="Enter Street Number and Name">
          <Input type="text" name="street1" />
        </InputGroup>
        <InputGroup label="Address Line 2" subLabel="Enter Apt, Unit, or Suite">
          <Input type="text" name="street2" />
        </InputGroup>
        <InputGroup label="City *">
          <Input type="text" name="city" />
        </InputGroup>
        <div class="grid grid-cols-2 gap-4">
          <InputGroup label="State *">
            <ListSelect list={states} selectMessage="Select a State" name="state" />
          </InputGroup>
          <InputGroup label="Zip Code *">
            <Input type="text" name="postalCode" />
          </InputGroup>
        </div>
      </form>
    </Card>
  );
}
