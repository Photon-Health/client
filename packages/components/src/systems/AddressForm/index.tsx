import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import * as zod from 'zod';
import gql from 'graphql-tag';
import Input from '../../particles/Input';
import InputGroup from '../../particles/InputGroup';
import { states } from './states';
import ListSelect from '../../particles/ListBox';
import Card from '../../particles/Card';
import Text from '../../particles/Text';
import Button from '../../particles/Button';
import { usePhotonClient } from '../SDKProvider';
import { createSignal } from 'solid-js';
import triggerToast from '../../utils/toastTriggers';
import Banner from '../../particles/Banner';

const addressSchema = zod.object({
  street1: zod.string().min(1, { message: 'Street 1 is required' }),
  street2: zod.string().optional(),
  city: zod.string().min(1, { message: 'City is required' }),
  state: zod.string().min(1, { message: 'State is required' }),
  postalCode: zod.string().min(5, { message: 'Postal code must be 5 digits' })
});

const UPDATE_PATIENT_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $address: AddressInput) {
    updatePatient(id: $id, address: $address) {
      id
    }
  }
`;

type AddressProps = {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type AddressFormProps = {
  patientId: string;
  setAddress?: (address: AddressProps) => void;
};

export default function AddressForm(props: AddressFormProps) {
  const [submitting, setSubmitting] = createSignal(false);
  const client = usePhotonClient();

  const updatePatientAddress = async (address: AddressProps) => {
    await client!.apollo.mutate({
      mutation: UPDATE_PATIENT_ADDRESS,
      variables: { id: props.patientId, address },
      update: () => {
        setSubmitting(false);
        triggerToast({
          header: 'Address Updated',
          body: 'The patient address has been updated.',
          status: 'success'
        });
        if (props?.setAddress) {
          props.setAddress(address);
        }
      }
    });
  };

  const { form, errors } = createForm({
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        updatePatientAddress({ country: 'US', ...values });
      } catch (e) {
        triggerToast({
          header: 'Error Updating Patient',
          body: 'The patient address has not been updated.',
          status: 'info'
        });
      }
    },
    extend: validator({ schema: addressSchema })
  });

  return (
    <Card addChildrenDivider={true}>
      <div class="flex items-center justify-between">
        <Text color="gray">Patient Address</Text>
        <Button type="submit" form="patient-address" disabled={submitting()} loading={submitting()}>
          Save Address
        </Button>
      </div>
      <div>
        <Banner status="info">Patient address is required to write a prescription</Banner>
        <form ref={form} id="patient-address" class="mt-4">
          <InputGroup
            label="Address Line 1 *"
            subLabel="Enter Street Number and Name"
            error={errors().street1}
          >
            <Input type="text" name="street1" />
          </InputGroup>
          <InputGroup label="Address Line 2" subLabel="Enter Apt, Unit, or Suite">
            <Input type="text" name="street2" />
          </InputGroup>
          <InputGroup label="City *" error={errors().city}>
            <Input type="text" name="city" />
          </InputGroup>
          <div class="grid grid-cols-1 sm:gap-4 sm:grid-cols-2">
            <InputGroup label="State *" error={errors().state}>
              <ListSelect list={states} selectMessage="Select a State" name="state" />
            </InputGroup>
            <InputGroup label="Zip Code *" error={errors().postalCode}>
              <Input type="text" name="postalCode" />
            </InputGroup>
          </div>
        </form>
      </div>
    </Card>
  );
}
