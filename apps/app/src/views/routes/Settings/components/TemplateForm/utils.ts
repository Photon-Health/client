import * as yup from 'yup';

export const TEMPLATE_SCHEMA = yup.object({
  treatment: yup
    .object({
      id: yup.string().required('Must select a treatment'),
      __typename: yup.string()
    })
    .required('Please select a treatment...'),
  dispenseAsWritten: yup.boolean(),
  dispenseQuantity: yup.number().min(1, 'Must be more than 0...').default(1),
  dispenseUnit: yup.string().when('values.treatment.__typename', {
    is: 'MedicalEquipment',
    then: yup.string().default('Each'),
    otherwise: yup.string().required('Please select a dispense unit...').default('Each')
  }),
  refillsInput: yup.number().when('values.treatment.__typename', {
    is: 'MedicalEquipment',
    then: yup.number().default(0),
    otherwise: yup.number().min(0, 'Must be at least 0...').default(0)
  }),
  daysSupply: yup.number().when('values.treatment.__typename', {
    is: 'MedicalEquipment',
    then: yup.number().default(0),
    otherwise: yup.number().min(0, 'Must be a number...').default(0)
  }),
  instructions: yup.string().min(1, 'Please enter instructions for the patient...'),
  notes: yup.string()
});

export const TEMPLATE_INITIAL_VALUES = {
  treatment: {
    id: '',
    name: '',
    __typename: ''
  },
  treatmentId: '',
  dispenseAsWritten: false,
  dispenseQuantity: 1,
  dispenseUnit: 'Each',
  fillsAllowed: 1,
  refillsInput: 0,
  daysSupply: 30,
  instructions: '',
  notes: ''
};
