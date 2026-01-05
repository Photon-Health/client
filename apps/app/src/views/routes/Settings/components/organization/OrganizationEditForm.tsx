import { FormControl, FormErrorMessage, FormLabel, Input, VStack } from '@chakra-ui/react';
import { ErrorMessage, Field, FieldProps, FormikProps } from 'formik';
import { FC } from 'react';
import * as yup from 'yup';
import { FormikStateSelect, yupStateSchema } from '../utils/States';

const phoneRegex =
  /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

export const organizationFormSchema = yup.object({
  name: yup.string().required('Organization name is required'),
  email: yup.string().required('Email is required').email('Enter a valid email'),
  fax: yup
    .string()
    .matches(phoneRegex, {
      message: 'Enter a valid fax number'
    })
    .test({
      message: 'Organization fax cannot be removed',
      test: (value, context) => {
        if (context.options.context?.initialValues.fax) {
          return !!value;
        }
        return true;
      }
    }),
  phone: yup
    .string()
    .matches(phoneRegex, {
      message: 'Enter a valid phone number'
    })
    .test({
      message: 'Organization phone cannot be removed',
      test: (value, context) => {
        if (context.options.context?.initialValues.phone) {
          return !!value;
        }
        return true;
      }
    }),
  address: yup
    .object({
      street1: yup.string().required('Address is required'),
      street2: yup.string(),
      city: yup.string().required('City is required'),
      state: yupStateSchema,
      postalCode: yup
        .string()
        .required('Zip code is required')
        .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, { message: 'Enter a valid zip code' })
    })
    .required('Enter an address')
});

const FieldComponent = ({ field }: FieldProps) => <Input {...field} />;

export const OrganizationForm: FC<FormikProps<yup.InferType<typeof organizationFormSchema>>> = ({
  values,
  errors,
  initialValues,
  setFieldTouched,
  setFieldValue
}) => {
  return (
    <form>
      <VStack align="stretch">
        <FormControl pb="2" isRequired isInvalid={!!errors.name}>
          <FormLabel htmlFor="name" mb={1}>
            Name
          </FormLabel>
          <Field name="name" component={FieldComponent} />
          <ErrorMessage name="name" component={FormErrorMessage} />
        </FormControl>
        <FormControl pb="2" isRequired isInvalid={!!errors.email}>
          <FormLabel htmlFor="email" mb={1}>
            Email
          </FormLabel>
          <Field name="email" component={FieldComponent} />
          <ErrorMessage name="email" component={FormErrorMessage} />
        </FormControl>
        <FormControl pb="2" isRequired={!!initialValues.fax} isInvalid={!!errors.fax}>
          <FormLabel htmlFor="fax" mb={1}>
            Fax
          </FormLabel>
          <Field name="fax" component={FieldComponent} />
          <ErrorMessage name="fax" component={FormErrorMessage} />
        </FormControl>
        <FormControl pb="2" isRequired={!!initialValues.phone} isInvalid={!!errors.phone}>
          <FormLabel htmlFor="phone" mb={1}>
            Phone
          </FormLabel>
          <Field name="phone" component={FieldComponent} />
          <ErrorMessage name="phone" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.address?.street1} pb="2">
          <FormLabel htmlFor="address.street1" mb={1}>
            Address 1
          </FormLabel>
          <Field name="address.street1" component={FieldComponent} />
          <ErrorMessage name="address.street1" component={FormErrorMessage} />
        </FormControl>
        <FormControl isInvalid={!!errors.address?.street2} pb="2">
          <FormLabel htmlFor="address.street2" mb={1}>
            Address 2
          </FormLabel>
          <Field name="address.street2" component={FieldComponent} />
          <ErrorMessage name="address.street2" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.address?.city} pb="2">
          <FormLabel htmlFor="address.city" mb={1}>
            City
          </FormLabel>
          <Field name="address.city" component={FieldComponent} />
          <ErrorMessage name="address.city" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.address?.state} pb="2">
          <FormLabel htmlFor="address.state" mb={1}>
            State
          </FormLabel>
          <FormikStateSelect
            value={values.address.state}
            setFieldTouched={setFieldTouched}
            setFieldValue={setFieldValue}
            fieldName="address.state"
          />
          <ErrorMessage name="address.state" component={FormErrorMessage} />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.address?.postalCode} pb="2">
          <FormLabel htmlFor="address.postalCode" mb={1}>
            Zip Code
          </FormLabel>
          <Field name="address.postalCode" component={FieldComponent} />
          <ErrorMessage name="address.postalCode" component={FormErrorMessage} />
        </FormControl>
      </VStack>
    </form>
  );
};
