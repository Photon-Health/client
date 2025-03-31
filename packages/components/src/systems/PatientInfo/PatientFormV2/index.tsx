import { createEffect, createMemo, onCleanup } from 'solid-js';
import { Card, PharmacySearch } from '@photonhealth/components';
import { isZip } from '../../../utils/isZip';
import { Name, Patient, SexType } from '@photonhealth/sdk/dist/types';
import { AuthorizedV2 } from '../../Authorized';
import { SexInput } from '../../../particles/SexInput';
import InputGroup from '../../../particles/InputGroup';
import Input from '../../../particles/Input';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import * as zod from 'zod';
import { undefined } from 'zod';
import ListSelect from '../../../particles/ListBox';
import { states } from '../../AddressForm/states';

type FormDataType = {
  firstName: string | undefined;
  lastName: string | undefined;
  dateOfBirth: any;
  phone: any;
  gender: string | null | undefined;
  sex: SexType | undefined;
  email: string | null;
  address_street1: string | null;
  address_street2: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | undefined;
  preferredPharmacy: string | undefined;
};

type PatientFormV2Props = {
  patient?: Patient;
  onFormUpdated?: (patient: EditFormPatient) => void;
};

export type EditFormPatient = Patient | { id?: string; name: Pick<Name, 'first' | 'last'> };

function mapToPatient(data: FormDataType, existing?: Patient): EditFormPatient {
  return {
    dateOfBirth: undefined,
    id: existing?.id,
    name: {
      first: data.firstName || '',
      last: data.lastName || ''
    },
    phone: undefined,
    sex: data.sex || SexType.Unknown,
    address: {
      street1: data.address_street1 || '',
      street2: data.address_street2 || '',
      city: data.address_city || '',
      state: data.address_state || '',
      postalCode: data.address_zip || '',
      country: 'US'
    }
  };
}

const PatientFormV2 = (props: PatientFormV2Props) => {
  onCleanup(() => {
    // pActions.clearSelectedPatient();
    // actions.reset();
  });

  const initialFormValues = createMemo(() => {
    return {
      firstName: props.patient?.name.first,
      lastName: props.patient?.name.last,
      dateOfBirth: props.patient?.dateOfBirth,
      phone: props.patient?.phone,
      gender: props.patient?.gender,
      sex: props.patient?.sex,
      email: props.patient?.email,
      address_street1: props.patient?.address?.street1,
      address_street2: props.patient?.address?.street2,
      address_city: props.patient?.address?.city,
      address_state: props.patient?.address?.state,
      address_zip: props.patient?.address?.postalCode,
      preferredPharmacy: props.patient?.preferredPharmacies?.[0]?.id
    };
  });

  const { form, errors, setData, data } = createForm({
    initialValues: initialFormValues(),
    onSubmit: async (_) => {
      console.log('submit patient form');
    },
    extend: validator({ schema: patientSchema })
  });

  createEffect(() => {
    const patient = mapToPatient(data());
    props.onFormUpdated && props.onFormUpdated(patient);
  });

  return (
    <div class="w-full h-full relative">
      {/*<Show when={pStore.selectedPatient.isLoading}>*/}
      {/*  <div class="w-full flex justify-center">*/}
      {/*    <Spinner color="green" />*/}
      {/*  </div>*/}
      {/*</Show>*/}

      {/*<Show when={!pStore.selectedPatient.isLoading}>*/}
      <AuthorizedV2 permissions={['write:patient']}>
        <form ref={form} id="patient-address" class="flex flex-col gap-8">
          <Card>
            <div>
              <p class="font-sans text-lg flex-grow">Personal</p>
              <div class="flex flex-col xs:flex-row xs:gap-4">
                <InputGroup label="First Name" errors={errors().firstName}>
                  <Input type="text" name="firstName" />
                </InputGroup>

                <InputGroup label="Last Name" errors={errors().lastName}>
                  <Input type="text" name="lastName" />
                </InputGroup>
              </div>
              <div class="flex flex-col xs:flex-row items-center xs:gap-4">
                <InputGroup label="Date of Birth" errors={errors().dateOfBirth}>
                  <Input type="text" name="dateOfBirth" />
                  {/*<DatePicker></DatePicker>*/}
                </InputGroup>

                <InputGroup label="Mobile Number" errors={errors().phone}>
                  <Input type="text" name="phone" />
                </InputGroup>
              </div>
              <div class="flex flex-col xs:flex-row justify-between xs:gap-4">
                <div class="flex-grow w-full xs:min-w-[40%]">
                  <InputGroup label="Gender" errors={errors().gender}>
                    <Input type="text" name="gender" />
                    {/*<GenderPicker/>*/}
                  </InputGroup>
                </div>
                <div class="flex-grow w-full xs:min-w-[40%]">
                  <SexInput
                    label="Sex at Birth"
                    disabled={false}
                    required={true}
                    // error={errors().sex}
                    onSexChange={(_) => false}
                  />
                </div>
              </div>
              <div class="mt-2">
                <InputGroup label="Email" errors={errors().email}>
                  <Input type="text" name="email" />
                </InputGroup>
              </div>
            </div>
          </Card>

          <Card>
            <div>
              <p class="font-sans text-lg flex-grow">Address</p>
              <InputGroup
                label="Street 1"
                subLabel="Enter Street Number and Name"
                errors={errors().address_street1}
              >
                <Input type="text" name="address_street1" />
              </InputGroup>
              <InputGroup label="Street 2" subLabel="Enter Apt, Unit, or Suite">
                <Input type="text" name="address_street2" />
              </InputGroup>
              <InputGroup label="City">
                <Input type="text" name="city" />
              </InputGroup>
              <div class="grid grid-cols-1 sm:gap-4 sm:grid-cols-2">
                <InputGroup label="State">
                  <ListSelect list={states} selectMessage="Select a State" name="state" />
                </InputGroup>
                <InputGroup label="Zip Code">
                  <Input type="text" name="address_zip" />
                </InputGroup>
              </div>
            </div>
          </Card>

          <Card>
            <div>
              <p class="font-sans text-lg flex-grow">Preferred Local Pharmacy</p>
              <PharmacySearch
                address={getPatientAddress(data(), props.patient)}
                setPharmacy={(pharmacy: any) => {
                  setData('preferredPharmacy', pharmacy.id);
                }}
                patientId={props.patient?.id}
                hidePreferred
              />
            </div>
          </Card>
        </form>
      </AuthorizedV2>
      {/*</Show>*/}
    </div>
  );
};

const patientSchema = zod.object({
  firstName: zod.string().min(1, { message: 'Please enter a first name.' }),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  dateOfBirth: zod.date().max(new Date(), 'Please enter a valid date of birth'),
  sex: zod.enum(['MALE', 'FEMALE', 'UNKNOWN']),
  phone: zod
    .string()
    .max(12, { message: 'Please enter a valid mobile number.' })
    .min(12, { message: 'Please enter a valid mobile number.' }),
  email: zod.string().email({ message: 'Please enter a valid email' }),
  address_zip: zod.string().min(5, { message: 'Please enter a valid zip code...' })
});

const getPatientAddress = (data: FormDataType, patient?: Patient) => {
  const patientAddress = patient?.address;
  if (
    data.address_zip &&
    isZip(data.address_zip) &&
    data.address_zip != patientAddress?.postalCode
  ) {
    return data.address_zip;
  }

  if (patientAddress) {
    return `${patientAddress.street1} ${patientAddress.street2 ?? ''} ${patientAddress.city}, ${
      patientAddress.state
    } ${patientAddress.postalCode}`;
  }

  return '';
};

export default PatientFormV2;
