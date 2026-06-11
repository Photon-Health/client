import Input from '../particles/Input';
import InputGroup from '../particles/InputGroup';
import StateSelect from '../particles/StateSelect';
import * as zod from 'zod';
import { zipCodeRegex } from '../utils/regex';
import AddressAutocompleteInput from '../particles/AddressAutocompleteInput';

export const AddressSchema = zod.object({
  street1: zod.string().min(1, { message: 'Street 1 is required' }),
  street2: zod.string().optional(),
  city: zod.string().min(1, { message: 'City is required' }),
  state: zod.string().length(2, { message: 'Enter a valid state' }),
  postalCode: zod.string().regex(zipCodeRegex, 'Enter a valid zip code')
});

export const AddressForm = (props: {
  data: Pick<zod.infer<typeof AddressSchema>, 'street1' | 'state'>;
  errors: {
    street1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  showRequired?: boolean;
  // TODO: Could we just turn this on for all instances?
  setAutocompleteFields?: (key: string, value: unknown) => void;
}) => {
  return (
    <>
      <InputGroup label="Address Line 1" error={props.errors.street1} required={props.showRequired}>
        {props.setAutocompleteFields ? (
          <AddressAutocompleteInput
            value={props.data.street1}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              props.setAutocompleteFields!('street1', e.currentTarget.value);
            }}
            onAddressSelect={(address) => {
              props.setAutocompleteFields!('street1', address.street1);
              props.setAutocompleteFields!('street2', address.street2);
              props.setAutocompleteFields!('city', address.city);
              props.setAutocompleteFields!('state', address.state);
              props.setAutocompleteFields!('postalCode', address.postalCode);
            }}
          />
        ) : (
          <Input type="text" name="street1" />
        )}
      </InputGroup>
      <InputGroup label="Address Line 2">
        <Input type="text" name="street2" />
      </InputGroup>
      <InputGroup label="City" error={props.errors.city} required={props.showRequired}>
        <Input type="text" name="city" />
      </InputGroup>
      <div class="grid grid-cols-1 sm:gap-4 sm:grid-cols-2">
        <InputGroup label="State" error={props.errors.state} required={props.showRequired}>
          <StateSelect name="state" value={props.data.state} />
        </InputGroup>
        <InputGroup label="Zip Code" error={props.errors.postalCode} required={props.showRequired}>
          <Input type="text" name="postalCode" />
        </InputGroup>
      </div>
    </>
  );
};
