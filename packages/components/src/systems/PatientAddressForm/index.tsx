import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import gql from 'graphql-tag';
import Card from '../../particles/Card';
import Text from '../../particles/Text';
import Button from '../../particles/Button';
import { usePhotonClient } from '../SDKProvider';
import { createSignal } from 'solid-js';
import triggerToast from '../../utils/toastTriggers';
import Banner from '../../particles/Banner';
import { AddressForm, AddressSchema } from '../AddressForm';

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

  const { form, data, errors } = createForm({
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
    extend: validator({ schema: AddressSchema })
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
          <AddressForm
            data={{ state: data().state }}
            errors={{
              street1: errors().street1?.[0],
              city: errors().city?.[0],
              state: errors().state?.[0],
              postalCode: errors().postalCode?.[0]
            }}
            showRequired={true}
          />
        </form>
      </div>
    </Card>
  );
}
