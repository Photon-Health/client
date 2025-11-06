import * as yup from 'yup';
import { yupStateSchema } from '../../Settings/components/utils/States';

export const signupFormSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().required('Email is required').email('Please enter a valid email'),
  npi: yup
    .string()
    .required('NPI is required')
    .matches(/^\d{10}$/, 'NPI must be a 10-digit number'),
  street1: yup.string().required('Street address is required'),
  street2: yup.string(),
  city: yup.string().required('City is required'),
  state: yupStateSchema,
  zip: yup
    .string()
    .required('ZIP code is required')
    .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, 'Enter a valid zip code'),
  didAgreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the Terms of Service and BAA')
    .required('You must agree to the Terms of Service and BAA')
});

export type SignupFormData = yup.InferType<typeof signupFormSchema>;
