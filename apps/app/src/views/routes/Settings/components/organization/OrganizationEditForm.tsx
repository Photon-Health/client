import { FormControl, FormErrorMessage, FormLabel, Input, VStack } from '@chakra-ui/react';
import { ErrorMessage, Field, FieldProps, FormikProps } from 'formik';
import { FC } from 'react';
import * as yup from 'yup';
import { FormikStateSelect, yupStateSchema } from '../utils/States';

const phoneRegex =
  /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

export const organizationFormSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required().min(1, 'Missing organization name'),
  fax: yup.string().matches(phoneRegex, {
    message: 'Please enter a valid fax number'
  }),
  phone: yup.string().matches(phoneRegex, {
    message: 'Please enter a valid phone number'
  }),
  email: yup.string().email('Please enter a valid email'),
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
    .required('Please enter an address')
});

const FieldComponent = ({ field }: FieldProps) => <Input {...field} />;

export const OrganizationForm: FC<FormikProps<yup.InferType<typeof organizationFormSchema>>> = ({
  values,
  errors,
  touched,
  setFieldTouched,
  setFieldValue
}) => (
  <form>
    <VStack align="stretch">
      <FormControl pb="2" isRequired>
        <FormLabel htmlFor="name" mb={1}>
          Name
        </FormLabel>
        <Field name="name" component={FieldComponent} />
      </FormControl>
      <FormControl
        isRequired
        isInvalid={!!errors.address?.street1 && touched.address?.street1}
        pb="2"
      >
        <FormLabel htmlFor="address.street1" mb={1}>
          Address 1
        </FormLabel>
        <Field name="address.street1" component={FieldComponent} />
        <ErrorMessage name="address.street1" component={FormErrorMessage} />
      </FormControl>
      <FormControl isInvalid={!!errors.address?.street2 && touched.address?.street2} pb="2">
        <FormLabel htmlFor="address.street2" mb={1}>
          Address 2
        </FormLabel>
        <Field name="address.street2" component={FieldComponent} />
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.address?.city && touched.address?.city} pb="2">
        <FormLabel htmlFor="address.city" mb={1}>
          City
        </FormLabel>
        <Field name="address.city" component={FieldComponent} />
      </FormControl>
      <FormControl
        isRequired
        isInvalid={!!errors.address?.state?.value && touched.address?.state?.value}
        pb="2"
      >
        <FormLabel htmlFor="address.state" mb={1}>
          State
        </FormLabel>
        <FormikStateSelect
          value={values.address.state}
          setFieldTouched={setFieldTouched}
          setFieldValue={setFieldValue}
          fieldName="address.state"
        />
      </FormControl>
      <FormControl
        isRequired
        isInvalid={!!errors.address?.postalCode && touched.address?.postalCode}
        pb="2"
      >
        <FormLabel htmlFor="address.postalCode" mb={1}>
          Zip Code
        </FormLabel>
        <Field name="address.postalCode" component={FieldComponent} />
      </FormControl>
      <FormControl pb="2" isRequired>
        <FormLabel htmlFor="phone" mb={1}>
          Phone
        </FormLabel>
        <Field name="phone" component={FieldComponent} />
      </FormControl>
      <FormControl pb="2" isRequired>
        <FormLabel htmlFor="fax" mb={1}>
          Fax
        </FormLabel>
        <Field name="fax" component={FieldComponent} />
      </FormControl>
      <FormControl pb="2" isRequired>
        <FormLabel htmlFor="email" mb={1}>
          Email
        </FormLabel>
        <Field name="email" component={FieldComponent} />
      </FormControl>
    </VStack>
  </form>
);
