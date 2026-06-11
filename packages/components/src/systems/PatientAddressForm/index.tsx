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
import { zipCodeRegex } from '../../utils/regex';

const addressSchema = zod.object({
  street1: zod.string().min(1, { message: 'Street 1 is required' }),
  street2: zod.string().optional(),
  city: zod.string().min(1, { message: 'City is required' }),
  state: zod.string().length(2, { message: 'Enter a valid state' }),
  postalCode: zod.string().regex(zipCodeRegex, 'Enter a valid zip code')
});

const UPDATE_PATIENT_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $address: AddressInput) {
    updatePatient(id: $id, address: $address) {
      id
      address {
        id
        street1
        street2
        city
        state
        postalCode
        country
      }
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

type PatientAddressFormProps = {
  patientId: string;
  setAddress?: (address: AddressProps) => void;
  showRequiredBanner?: boolean;
  openStateDropdownUpward?: boolean;
};

export default function PatientAddressForm(props: PatientAddressFormProps) {
  const [submitting, setSubmitting] = createSignal(false);
  const client = usePhotonClient();
  const showRequiredBanner = () => props.showRequiredBanner ?? true;

  const updatePatientAddress = async (address: AddressProps) => {
    const { data } = await client!.apollo.mutate({
      mutation: UPDATE_PATIENT_ADDRESS,
      variables: { id: props.patientId, address }
    });
    setSubmitting(false);
    triggerToast({
      header: 'Address Updated',
      body: 'The patient address has been updated.',
      status: 'success'
    });
    if (props?.setAddress) {
      props.setAddress(data?.updatePatient?.address ?? address);
    }
  };

  const { form, errors } = createForm({
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await updatePatientAddress({ country: 'US', ...values });
      } catch (_e) {
        setSubmitting(false);
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
          Save address
        </Button>
      </div>
      <div>
        {showRequiredBanner() && (
          <Banner status="info">Patient address is required to write a prescription</Banner>
        )}
        <form ref={form} id="patient-address" class="mt-4">
          <InputGroup label="Address Line 1 *" error={errors().street1}>
            <Input type="text" name="street1" />
          </InputGroup>
          <InputGroup label="Address Line 2">
            <Input type="text" name="street2" />
          </InputGroup>
          <InputGroup label="City *" error={errors().city}>
            <Input type="text" name="city" />
          </InputGroup>
          <div class="grid grid-cols-1 sm:gap-4 sm:grid-cols-2">
            <InputGroup label="State *" error={errors().state}>
              <ListSelect
                list={states}
                selectMessage="Select a State"
                name="state"
                openUpward={props.openStateDropdownUpward}
              />
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
