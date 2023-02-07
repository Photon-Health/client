import * as yup from 'yup';
import { Formik, Field } from 'formik';

import {
  Alert,
  AlertIcon,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  VStack
} from '@chakra-ui/react';

import React, { useEffect } from 'react';
import { usePhoton } from '@photonhealth/react';
import { capitalizeFirst } from '../../../../utils';

const hookSchema = yup.object({
  url: yup
    .string()
    .required('Please enter a URL to receive webhooks')
    .matches(
      /(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~]*)*(#[\w-]*)?(\?.*)?/,
      'Please enter a valid URL'
    ),
  sharedSecret: yup.string().matches(/^\S*$/, 'Secrets cannot contain any whitespace'),
  radioGroup: yup.string().required('Please select one of the options'),
  filters: yup.array()
});

interface WebhooksFormValues {
  url: string;
  sharedSecret: string;
  radioGroup: string;
  filters: string[];
}

interface WebhooksFormProps {
  isOpen: boolean;
  close: () => void;
}

export const WebhooksForm = ({ isOpen, close }: WebhooksFormProps) => {
  const [eventValue, setEventValue] = React.useState('');

  const { createWebhook } = usePhoton();
  const [createWebhookConfig, { loading, error }] = createWebhook({
    refetchQueries: ['getWebhooks'],
    awaitRefetchQueries: true
  });

  const initialValues: WebhooksFormValues = {
    url: '',
    sharedSecret: '',
    radioGroup: '',
    filters: []
  };

  const allFilters = [
    'photon:order:created',
    'photon:order:placed',
    'photon:order:fulfillment',
    'photon:order:completed',
    'photon:order:error',
    'photon:prescription:created',
    'photon:prescription:depleted',
    'photon:prescription:expired',
    'photon:prescription:active'
  ];

  useEffect(() => {
    if (!isOpen) setEventValue('');
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={close} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Webhook</ModalHeader>
        <ModalBody>
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error.message}
            </Alert>
          )}
          <Formik
            initialValues={initialValues}
            validationSchema={hookSchema}
            onSubmit={async (values, { validateForm }) => {
              validateForm(values);
              if (eventValue === 'all') {
                // eslint-disable-next-line no-param-reassign
                values.filters = allFilters;
              }
              createWebhookConfig({ variables: values, onCompleted: close });
            }}
          >
            {({ setFieldValue, handleSubmit, errors, touched }) => {
              return (
                <form onSubmit={handleSubmit} noValidate>
                  <VStack spacing={2} align="stretch">
                    <FormControl isInvalid={!!errors.url && touched.url} pb="4">
                      <FormLabel htmlFor="url" mb={1}>
                        Payload URL
                      </FormLabel>
                      <FormHelperText mb={2} mt={0}>
                        Example: https://example.com/postreceive
                      </FormHelperText>
                      <Field as={Input} name="url" />
                      <FormErrorMessage>{errors.url}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.sharedSecret && touched.sharedSecret} pb="4">
                      <FormLabel htmlFor="sharedSecret" mb={1}>
                        Secret
                      </FormLabel>
                      <FormHelperText mb={2} mt={0}>
                        You will not be able to view this secret again after the webhook is created.
                      </FormHelperText>
                      <Field as={Input} name="sharedSecret" />
                      <FormErrorMessage>{errors.sharedSecret}</FormErrorMessage>
                    </FormControl>
                    <FormControl pb="4" isInvalid={!!errors.radioGroup && touched.radioGroup}>
                      <FormLabel htmlFor="url">Events</FormLabel>
                      <Field as={RadioGroup} onChange={setEventValue} value={eventValue}>
                        <Stack direction="column">
                          <Field as={Radio} name="radioGroup" value="all">
                            Send me all events
                          </Field>
                          <Field as={Radio} name="radioGroup" value="some">
                            Let me select specific events
                          </Field>
                        </Stack>
                      </Field>
                      <FormErrorMessage>{errors.radioGroup}</FormErrorMessage>
                    </FormControl>
                    {eventValue === 'some' && (
                      <FormControl isInvalid={!!errors.filters && touched.filters} pb="4">
                        <Field
                          as={CheckboxGroup}
                          name="filters"
                          onChange={() => {
                            setFieldValue('filters', []);
                          }}
                        >
                          <HStack alignItems="start" spacing={20}>
                            <SimpleGrid columns={[2]} spacing={3}>
                              {allFilters.map((filter) => (
                                <Field as={Checkbox} name="filters" value={filter}>
                                  {capitalizeFirst(filter.split(':').slice(1).join(' '))}
                                </Field>
                              ))}
                            </SimpleGrid>
                          </HStack>
                        </Field>
                      </FormControl>
                    )}
                  </VStack>
                  <ModalFooter px="0">
                    <Button variant="outline" mr={3} onClick={close}>
                      Close
                    </Button>
                    <Button type="submit" colorScheme="brand" disabled={loading}>
                      Create Webhook
                    </Button>
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
