import Input from '../particles/Input';
import InputGroup from '../particles/InputGroup';
import StateSelect from '../particles/StateSelect';
import * as zod from 'zod';
import { zipCodeRegex } from '../utils/regex';
import AddressAutocompleteInput from '../particles/AddressAutocompleteInput';

export const addressSchema = zod.object({
  street1: zod
    .string({ required_error: 'Address line 1 is required' })
    .min(1, { message: 'Address line 1 is required' }),
  street2: zod.string().optional(),
  city: zod.string({ required_error: 'City is required' }).min(1, { message: 'City is required' }),
  state: zod
    .string({ required_error: 'State is required' })
    .length(2, { message: 'Enter a valid state' }),
  postalCode: zod
    .string({ required_error: 'Zip code is required' })
    .regex(zipCodeRegex, 'Enter a valid zip code')
});

// This component is currently designed for use with createForm from @felte
// If it needs to be used with other form stores, add an onChange handler
export const AddressForm = (props: {
  data: zod.infer<typeof addressSchema>;
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
          <Input type="text" name="street1" value={props.data.street1} />
        )}
      </InputGroup>
      <InputGroup label="Address Line 2">
        <Input type="text" name="street2" value={props.data.street2} />
      </InputGroup>
      <InputGroup label="City" error={props.errors.city} required={props.showRequired}>
        <Input type="text" name="city" value={props.data.city} />
      </InputGroup>
      <div class="grid grid-cols-1 sm:gap-4 sm:grid-cols-2">
        <InputGroup label="State" error={props.errors.state} required={props.showRequired}>
          {/* Need to pass value for styling */}
          <StateSelect name="state" value={props.data.state} />
        </InputGroup>
        <InputGroup label="Zip Code" error={props.errors.postalCode} required={props.showRequired}>
          <Input type="text" name="postalCode" value={props.data.postalCode} />
        </InputGroup>
      </div>
    </>
  );
};
