import { FormControl, FormErrorMessage, FormLabel, Input, VStack } from '@chakra-ui/react';
import { ErrorMessage, Field, FieldProps, FormikProps } from 'formik';
import { FC } from 'react';
import * as yup from 'yup';
import { FormikStateSelect, yupStateSchema } from '../utils/States';
import { rolesSchema } from '../utils/Roles';

const phoneRegex =
  /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

const hasPrescriberRole = (roles: { value: string; label: string }[]) =>
  roles.some((r) => r.label === 'Prescriber');

export const profileFormSchema = yup.object({
  name: yup.object({
    title: yup.string(),
    first: yup.string().required('First name is required'),
    middle: yup.string(),
    last: yup.string().required('Last name is required')
  }),
  email: yup.string().required('Email is required').email('Enter a valid email'),
  // `roles` is not editable in this form but need to keep to use for validation
  // in other fields
  roles: rolesSchema.required().min(1, 'Must have at least one role'),
  phone: yup
    .string()
    .matches(phoneRegex, {
      message: 'Enter a valid phone number'
    })
    .test({
      message: 'Prescriber phone cannot be removed',
      test: (value, context) => {
        if (!hasPrescriberRole(context.options.context?.initialValues.roles)) {
          return true;
        }
        if (context.options.context?.initialValues.phone) {
          return !!value;
        }
        return true;
      }
    }),
  fax: yup
    .string()
    .matches(phoneRegex, {
      message: 'Enter a valid fax number'
    })
    .test({
      message: 'Prescriber fax cannot be removed',
      test: (value, context) => {
        if (!hasPrescriberRole(context.options.context?.initialValues.roles)) {
          return true;
        }
        if (context.options.context?.initialValues.fax) {
          return !!value;
        }
        return true;
      }
    }),
  npi: yup
    .string()
    .when('roles', (roles: { value: string; label: string }[], schema: yup.BaseSchema) => {
      return hasPrescriberRole(roles)
        ? schema.required('NPI is required for prescribers')
        : schema.notRequired();
    })
    .matches(/^[0-9]+$/, { message: 'Enter a valid NPI' }),
  address: yup.object({
    street1: yup.string().required('Address is required'),
    street2: yup.string(),
    city: yup.string().required('City is required'),
    state: yupStateSchema,
    postalCode: yup
      .string()
      .required('Zip code is required')
      .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, { message: 'Enter a valid zip code' })
  })
});

type ProfileYupType = yup.InferType<typeof profileFormSchema>;

const FieldComponent = ({ field }: FieldProps) => <Input {...field} />;

export const ProfileForm: FC<FormikProps<ProfileYupType>> = ({
  values,
  errors,
  setFieldTouched,
  setFieldValue
}) => {
  const isPrescriber = hasPrescriberRole(values.roles);

  return (
    <form>
      <VStack align="stretch">
        <FormControl pb="2" isInvalid={!!errors.name?.title}>
          <FormLabel htmlFor="name.title" mb={1}>
            Title
          </FormLabel>
          <Field name="name.title" component={FieldComponent} />
          <ErrorMessage name="name.title" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.name?.first} pb="2">
          <FormLabel htmlFor="name.first" mb={1}>
            First Name
          </FormLabel>
          <Field name="name.first" component={FieldComponent} />
          <ErrorMessage name="name.first" component={FormErrorMessage} />
        </FormControl>
        <FormControl pb="2" isInvalid={!!errors.name?.middle}>
          <FormLabel htmlFor="name.middle" mb={1}>
            Middle Name
          </FormLabel>
          <Field name="name.middle" component={FieldComponent} />
          <ErrorMessage name="name.middle" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.name?.last} pb="2">
          <FormLabel htmlFor="name.first" mb={1}>
            Last Name
          </FormLabel>
          <Field name="name.last" component={FieldComponent} />
          <ErrorMessage name="name.last" component={FormErrorMessage} />
        </FormControl>
        <FormControl pb="2" isRequired isInvalid={!!errors?.email}>
          <FormLabel htmlFor="email" mb={1}>
            Email
          </FormLabel>
          <Field name="email" component={FieldComponent} />
          <ErrorMessage name="email" component={FormErrorMessage} />
        </FormControl>
        <FormControl pb="2" isRequired={isPrescriber} isInvalid={!!errors?.phone}>
          <FormLabel htmlFor="phone" mb={1}>
            Phone
          </FormLabel>
          <Field name="phone" component={FieldComponent} />
          <ErrorMessage name="phone" component={FormErrorMessage} />
        </FormControl>
        <FormControl pb="2" isRequired={isPrescriber} isInvalid={!!errors?.fax}>
          <FormLabel htmlFor="fax" mb={1}>
            Fax
          </FormLabel>
          <Field name="fax" component={FieldComponent} />
          <ErrorMessage name="fax" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors?.address?.street1} pb="2">
          <FormLabel htmlFor="address.street1" mb={1}>
            Address 1
          </FormLabel>
          <Field name="address.street1" component={FieldComponent} />
          <ErrorMessage name="address.street1" component={FormErrorMessage} />
        </FormControl>
        <FormControl isInvalid={!!errors?.address?.street2} pb="2">
          <FormLabel htmlFor="address.street2" mb={1}>
            Address 2
          </FormLabel>
          <Field name="address.street2" component={FieldComponent} />
          <ErrorMessage name="address.street2" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors?.address?.city} pb="2">
          <FormLabel htmlFor="address.city" mb={1}>
            City
          </FormLabel>
          <Field name="address.city" component={FieldComponent} />
          <ErrorMessage name="address.city" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors?.address?.state} pb="2">
          <FormLabel htmlFor="address.state" mb={1}>
            State
          </FormLabel>
          <FormikStateSelect
            value={values.address?.state}
            setFieldTouched={setFieldTouched}
            setFieldValue={setFieldValue}
            fieldName="address.state"
          />
          <ErrorMessage name="address.state" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors?.address?.postalCode} pb="2">
          <FormLabel htmlFor="address.postalCode" mb={1}>
            Zip Code
          </FormLabel>
          <Field name="address.postalCode" component={FieldComponent} />
          <ErrorMessage name="address.postalCode" component={FormErrorMessage} />
        </FormControl>
        {isPrescriber && (
          <FormControl pb="2" isRequired isReadOnly isInvalid={!!errors?.npi}>
            <FormLabel htmlFor="npi" mb={1}>
              NPI
            </FormLabel>
            <Field name="npi" component={FieldComponent} />
            <ErrorMessage name="npi" component={FormErrorMessage} />
          </FormControl>
        )}
      </VStack>
    </form>
  );
};
