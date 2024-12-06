import * as yup from 'yup';

export const TEMPLATE_SCHEMA = yup.object({
  treatment: yup
    .object({
      id: yup.string().required('Must select a treatment'),
      __typename: yup.string().optional(),
      name: yup.string()
    })
    .required('Please select a treatment...'),
  dispenseAsWritten: yup.boolean().nullable().optional(),
  dispenseQuantity: yup
    .number()
    .moreThan(0, 'Must be greater than 0...')
    .default(1)
    .nullable()
    .optional(),
  dispenseUnit: yup.string().when('values.treatment.__typename', {
    is: 'MedicalEquipment',
    then: yup.string().default('Each'),
    otherwise: yup.string().required('Please select a dispense unit...').default('Each')
  }),
  fillsAllowed: yup.number(),
  refillsInput: yup.number().when('values.treatment.__typename', {
    is: 'MedicalEquipment',
    then: yup.number().default(0),
    otherwise: yup.number().min(0, 'Must be at least 0...').default(0)
  }),
  daysSupply: yup.number().when('values.treatment.__typename', {
    is: 'MedicalEquipment',
    then: yup.number().default(0),
    otherwise: yup.number().min(1, 'Must be 1 or more...').default(0)
  }),
  instructions: yup.string().min(1, 'Please enter instructions for the patient...'),
  notes: yup.string(),
  name: yup.string(),
  isPublic: yup.boolean().default(false)
});

export type TemplateSchemaType = yup.InferType<typeof TEMPLATE_SCHEMA>;

export const TEMPLATE_INITIAL_VALUES: TemplateSchemaType = {
  treatment: {
    id: '',
    name: '',
    __typename: ''
  },
  name: '',
  dispenseAsWritten: false,
  dispenseQuantity: 0,
  dispenseUnit: 'Each',
  fillsAllowed: 1,
  refillsInput: 0,
  daysSupply: 0,
  instructions: '',
  notes: '',
  isPublic: false
};
