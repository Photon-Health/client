import { FormControl, FormErrorMessage, FormLabel, Input, VStack } from '@chakra-ui/react';
import { ErrorMessage, Field, FieldProps, FormikErrors, FormikProps, FormikTouched } from 'formik';
import { FC } from 'react';
import * as yup from 'yup';
import { FormikStateSelect, yupStateSchema } from '../utils/States';
import { rolesSchema } from '../utils/Roles';

const hasPrescriberRole = (roles: { value: string; label: string }[]) =>
  roles.some((r) => r.label === 'Prescriber');

export const profileFormSchema = yup
  .object({
    name: yup
      .object({
        title: yup.string(),
        first: yup.string().required('First name is required'),
        middle: yup.string(),
        last: yup.string().required('Last name is required')
      })
      .required('Please enter an address'),
    fax: yup
      .string()
      .matches(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/, {
        message: 'Please enter a valid fax number'
      }),
    email: yup.string().email('Invalid email').required('email is required for providers'),
    roles: rolesSchema.required().min(1, 'Must have at least one role'),
    provider: yup
      .object({
        npi: yup
          .string()
          .required('NPI is required for prescribers')
          .matches(/^[0-9]+$/, { message: 'Invalid NPI' }),
        address: yup
          .object({
            street1: yup.string().required('Address is required'),
            street2: yup.string(),
            city: yup.string().required('City is required'),
            state: yupStateSchema,
            postalCode: yup
              .string()
              .required('Zip is required')
              .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, { message: 'Enter a valid zipcode' })
          })
          .required('Please enter an address'),
        phone: yup
          .string()
          .matches(
            /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
            { message: 'Please enter a valid phone number' }
          )
          .required('Please enter a valid phone number')
      })
      .notRequired()
      .default(undefined)
      .when('roles', (roles: { value: string; label: string }[], schema) => {
        return hasPrescriberRole(roles)
          ? schema.required(
              "Address, NPI and phone are required for users with 'Prescriber' permissions"
            )
          : schema.notRequired();
      })
  })
  // If not a prescriber, set the provider to undefined
  .transform((value) => {
    if (hasPrescriberRole(value.roles)) {
      return value;
    }
    return { ...value, provider: undefined };
  });

type ProfileYupType = yup.InferType<typeof profileFormSchema>;
type ProviderYupType = ProfileYupType['provider'];
type ProviderFormikTouchedType = FormikTouched<ProviderYupType>;
type ProviderFormikErrorsType = FormikErrors<ProviderYupType>;

const FieldComponent = ({ field }: FieldProps) => <Input {...field} />;

export const ProfileForm: FC<FormikProps<ProfileYupType>> = ({
  values,
  errors,
  touched,
  setFieldTouched,
  setFieldValue
}) => {
  const providerErrors = errors.provider as ProviderFormikErrorsType | undefined;
  const providerTouched = touched.provider as ProviderFormikTouchedType | undefined;

  return (
    <form>
      <VStack align="stretch">
        <FormControl pb="2">
          <FormLabel htmlFor="name.title" mb={1}>
            Title
          </FormLabel>
          <Field name="name.title" component={FieldComponent} />
          <ErrorMessage name="name.title" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.name?.first && touched?.name?.first} pb="2">
          <FormLabel htmlFor="name.first" mb={1}>
            First name
          </FormLabel>
          <Field name="name.first" component={FieldComponent} />
          <ErrorMessage name="name.first" component={FormErrorMessage} />
        </FormControl>
        <FormControl pb="2">
          <FormLabel htmlFor="name.middle" mb={1}>
            Middle Name
          </FormLabel>
          <Field name="name.middle" component={FieldComponent} />
          <ErrorMessage name="name.middle" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.name?.last && touched?.name?.last} pb="2">
          <FormLabel htmlFor="name.first" mb={1}>
            Last name
          </FormLabel>
          <Field name="name.last" component={FieldComponent} />
          <ErrorMessage name="name.last" component={FormErrorMessage} />
        </FormControl>
        <FormControl
          isRequired
          isInvalid={!!providerErrors?.address?.street1 && providerTouched?.address?.street1}
          pb="2"
        >
          <FormLabel htmlFor="provider.address.street1" mb={1}>
            Address 1
          </FormLabel>
          <Field name="provider.address.street1" component={FieldComponent} />
          <ErrorMessage name="provider.address.street1" component={FormErrorMessage} />
        </FormControl>
        <FormControl
          isInvalid={!!providerErrors?.address?.street2 && providerTouched?.address?.street2}
          pb="2"
        >
          <FormLabel htmlFor="provider.address.street2" mb={1}>
            Address 2
          </FormLabel>
          <Field name="provider.address.street2" component={FieldComponent} />
        </FormControl>
        <FormControl
          isRequired
          isInvalid={!!providerErrors?.address?.city && providerTouched?.address?.city}
          pb="2"
        >
          <FormLabel htmlFor="provider.address.city" mb={1}>
            City
          </FormLabel>
          <Field name="provider.address.city" component={FieldComponent} />
        </FormControl>
        <FormControl
          isRequired
          isInvalid={
            !!providerErrors?.address?.state?.value && providerTouched?.address?.state?.value
          }
          pb="2"
        >
          <FormLabel htmlFor="provider.address.state" mb={1}>
            State
          </FormLabel>
          <FormikStateSelect
            value={
              values.provider?.address?.state?.value
                ? { value: values.provider?.address?.state?.value }
                : undefined
            }
            setFieldTouched={setFieldTouched}
            setFieldValue={setFieldValue}
            fieldName="provider.address.state"
          />
        </FormControl>
        <FormControl
          isRequired
          isInvalid={!!providerErrors?.address?.postalCode && providerTouched?.address?.postalCode}
          pb="2"
        >
          <FormLabel htmlFor="provider.address.postalCode" mb={1}>
            Zip Code
          </FormLabel>
          <Field name="provider.address.postalCode" component={FieldComponent} />
        </FormControl>
        <FormControl
          pb="2"
          isRequired
          isInvalid={!!providerErrors?.phone && providerTouched?.phone}
        >
          <FormLabel htmlFor="provider.phone" mb={1}>
            Phone
          </FormLabel>
          <Field name="provider.phone" component={FieldComponent} />
        </FormControl>
        <FormControl pb="2">
          <FormLabel htmlFor="fax" mb={1}>
            Fax
          </FormLabel>
          <Field name="fax" component={FieldComponent} />
        </FormControl>
        {hasPrescriberRole(values.roles) && (
          <FormControl pb="2" isRequired isReadOnly isInvalid={!!providerErrors?.npi}>
            <FormLabel htmlFor="provider.npi" mb={1}>
              NPI
            </FormLabel>
            <Field name="provider.npi" component={FieldComponent} />
            <ErrorMessage name="provider.npi" component={FormErrorMessage} />
          </FormControl>
        )}
        <FormControl pb="2" isRequired isInvalid={!!errors?.email && touched?.email}>
          <FormLabel htmlFor="email" mb={1}>
            Email
          </FormLabel>
          <Field name="email" component={FieldComponent} />
        </FormControl>
      </VStack>
    </form>
  );
};
