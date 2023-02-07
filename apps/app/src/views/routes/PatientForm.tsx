import * as yup from 'yup';
import { Formik, Field } from 'formik';
import InputMask from 'react-input-mask';
import parsePhoneNumber from 'libphonenumber-js';
import dayjs from 'dayjs';

import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useColorMode,
  VStack
} from '@chakra-ui/react';

import { FiUser } from 'react-icons/fi';

import { useNavigate } from 'react-router-dom';
import { usePhoton } from '@photonhealth/react';
import { confirmWrapper } from '../components/GuardDialog';
import { OptionalText } from '../components/OptionalText';

const genderOptions = [
  'Male/Man',
  'Female/Woman',
  'TransMale/TransMan',
  'TransFemale/TransWoman',
  'Genderqueer/Gender nonconforming',
  'Something else',
  'Decline to answer'
];

const sexOptions = ['Male', 'Female', 'Unknown'];

const patientSchema = yup.object({
  name: yup
    .object({
      first: yup.string().required('Please enter a first name...'),
      last: yup.string().required('Please enter a last name...')
    })
    .required(),
  dateOfBirth: yup
    .date()
    .min(new Date(1900, 0, 1), 'Please enter a date later than 1/1/1900...')
    .max(new Date(), 'Please enter a date before today...')
    .required('Please enter a date of birth...'),
  sex: yup
    .string()
    .oneOf(
      sexOptions.map((s) => s.toUpperCase()),
      'Please select Male, Female, or Unknown'
    )
    .required('Please select a sex at birth...'),
  gender: yup.string().oneOf(genderOptions, 'Please select from the options...'),
  phone: yup.string().required('Please enter a phone number...'),
  email: yup
    .string()
    .email('Email should be something like name@email.com...')
    .required('Please enter an email address...')
});

interface PatientFormValues {
  name: {
    first: string;
    last: string;
  };
  dateOfBirth: string;
  sex: (typeof sexOptions)[number];
  gender?: (typeof genderOptions)[number];
  phone: string;
  email: string;
}

export const PatientForm = () => {
  const { createPatient } = usePhoton();
  const [createPatientMutation, { loading, error }] = createPatient({
    refetchQueries: ['getPatients'],
    awaitRefetchQueries: true
  });

  const navigate = useNavigate();
  const onClose = () => {
    navigate('/patients');
  };

  const initialValues: PatientFormValues = {
    name: {
      first: '',
      last: ''
    },
    dateOfBirth: '',
    sex: '',
    gender: '',
    phone: '',
    email: ''
  };

  const { colorMode } = useColorMode();

  const onCancel = async (dirty: Boolean) => {
    if (!dirty) onClose();
    else if (
      await confirmWrapper('Lose unsaved patient?', {
        description: 'You will not be able to recover unsaved patient information.',
        cancelText: 'Keep Editing',
        confirmText: 'Yes, Cancel',
        darkMode: colorMode !== 'light'
      })
    ) {
      onClose();
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="xl" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <FiUser />
            <Text textAlign="center">New Patient</Text>
          </HStack>
        </ModalHeader>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error.message}
          </Alert>
        )}
        <ModalBody>
          <Formik
            validateOnBlur={false}
            initialValues={initialValues}
            validationSchema={patientSchema}
            onSubmit={(values, { validateForm }) => {
              // Stripping mask from phone number before submit
              const vars = {
                ...values,
                phone: parsePhoneNumber(values.phone, 'US')?.format('E.164') || values.phone
              };

              validateForm(vars);
              createPatientMutation({ variables: vars, onCompleted: onClose });
            }}
          >
            {({
              handleChange,
              handleBlur,
              setFieldValue,
              handleSubmit,
              dirty,
              errors,
              touched
            }) => {
              return (
                <form onSubmit={handleSubmit} noValidate>
                  <VStack spacing={6} align="stretch" pb="8">
                    <HStack spacing="8" align="flex-start">
                      <FormControl isInvalid={!!errors.name?.first && touched.name?.first} pb="4">
                        <FormLabel htmlFor="name.first">First Name</FormLabel>
                        <Field as={Input} name="name.first" />
                        <FormErrorMessage>{errors.name?.first}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.name?.last && touched.name?.last} pb="4">
                        <FormLabel htmlFor="name.last">Last Name</FormLabel>
                        <Field as={Input} name="name.last" />
                        <FormErrorMessage>{errors.name?.last}</FormErrorMessage>
                      </FormControl>
                    </HStack>
                    <HStack spacing="8" align="flex-start">
                      <FormControl isInvalid={!!errors.dateOfBirth && touched.dateOfBirth} pb="4">
                        <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
                        <Field
                          as={Input}
                          name="dateOfBirth"
                          type="date"
                          max="9999-12-31"
                          onPaste={(e: any) => {
                            const paste = (
                              e.clipboardData || (window as any).clipboardData
                            ).getData('text');
                            const parsed = dayjs(paste).format('YYYY-MM-DD');
                            setFieldValue('dateOfBirth', parsed);
                          }}
                        />
                        <FormErrorMessage>{errors.dateOfBirth}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.phone && touched.phone} pb="4">
                        <FormLabel htmlFor="phone">Phone Number</FormLabel>
                        <Input
                          as={InputMask}
                          alwaysShowMask
                          name="phone"
                          type="tel"
                          mask="(999) 999-9999"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onPaste={(e: any) => {
                            e.preventDefault();
                            const paste = (
                              e.clipboardData || (window as any).clipboardData
                            ).getData('text');
                            const parsed = parsePhoneNumber(paste, 'US');
                            const formatted = `(${parsed?.nationalNumber.slice(
                              0,
                              3
                            )}) ${parsed?.nationalNumber.slice(
                              3,
                              6
                            )}-${parsed?.nationalNumber.slice(6)}`;
                            e.target.value = formatted;
                            setFieldValue('phone', parsed?.nationalNumber);
                          }}
                        />
                        <FormErrorMessage>{errors.phone}</FormErrorMessage>
                      </FormControl>
                    </HStack>
                    <HStack spacing="8" align="flex-start">
                      <FormControl isInvalid={!!errors.gender && touched.gender} pb="4">
                        <FormLabel htmlFor="gender" optionalIndicator={<OptionalText />}>
                          Gender
                        </FormLabel>
                        <Field as={Select} name="gender" placeholder=" ">
                          {genderOptions.map((option) => {
                            const lowercaseOption = option.toLowerCase();
                            return (
                              <option key={lowercaseOption} value={option}>
                                {option}
                              </option>
                            );
                          })}
                          <FormErrorMessage>{errors.gender}</FormErrorMessage>
                        </Field>
                      </FormControl>
                      <FormControl isInvalid={!!errors.sex && touched.sex} pb="4">
                        <FormLabel htmlFor="sex">Sex at Birth</FormLabel>
                        <Field as={Select} name="sex" placeholder=" ">
                          {sexOptions.map((option) => {
                            const lowercaseOption = option.toLowerCase();
                            const uppercaseOption = option.toUpperCase();
                            return (
                              <option key={lowercaseOption} value={uppercaseOption}>
                                {option}
                              </option>
                            );
                          })}
                        </Field>
                        <FormErrorMessage>{errors.sex}</FormErrorMessage>
                      </FormControl>
                    </HStack>
                    <FormControl isInvalid={!!errors.email && touched.email} pb="4">
                      <FormLabel htmlFor="email">Email Address</FormLabel>
                      <Field as={Input} name="email" type="email" />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  </VStack>
                  <ModalFooter px="0">
                    <HStack>
                      <Button
                        borderColor="blue.500"
                        textColor="blue.500"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => onCancel(dirty)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        colorScheme="brand"
                        disabled={loading}
                        isLoading={loading}
                        loadingText="Saving"
                      >
                        Create Patient
                      </Button>
                    </HStack>
                  </ModalFooter>
                </form>
              );
            }}
          </Formik>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
