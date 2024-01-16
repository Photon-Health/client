import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  FormErrorMessage,
  Textarea,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';
import * as yup from 'yup';
import { JSX } from 'react';
import { ErrorMessage, Field, Formik, Form } from 'formik';
import { usePhoton } from '@photonhealth/react';
import { graphql } from '../../gql';
import { useMutation } from '@apollo/client';
import { StyledToast } from './StyledToast';

export const createTicketMutation = graphql(/* GraphQL */ `
  mutation TicketModalCreateTicket($input: TicketInput!) {
    createTicket(input: $input) {
      id
    }
  }
`);

const ticketSchema = yup.object({
  description: yup.string().min(1, 'Description is required.').required('Description is required.')
});

const initialValues: yup.InferType<typeof ticketSchema> = {
  description: ''
};

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  body: JSX.Element;
  prependContext?: string;
};

export const TicketModal = ({
  isOpen,
  onClose,
  subject,
  body,
  prependContext
}: TicketModalProps) => {
  const toast = useToast();
  const { clinicalClient } = usePhoton();

  const [createTicket, { error, loading }] = useMutation(createTicketMutation, {
    client: clinicalClient
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      size="xl"
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent maxW="28rem">
        <ModalHeader>
          <HStack>
            <Text flex="1" align="left">
              Report issue with this order
            </Text>
            <ModalCloseButton right="4" top="4" left="unset" onClick={onClose} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4} width="100%" align="left">
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error.message}
              </Alert>
            )}
            {body}
            <Formik
              initialValues={initialValues}
              validationSchema={ticketSchema}
              onSubmit={async (values, { validateForm, resetForm }) => {
                await validateForm(values);
                await createTicket({
                  variables: {
                    input: {
                      subject,
                      comment: {
                        body: `${prependContext ? `${prependContext}\n` : ''}${values.description}`
                      }
                    }
                  }
                });
                toast({
                  position: 'top-right',
                  duration: 4000,
                  render: ({ onClose }) => (
                    <StyledToast
                      onClose={onClose}
                      type="success"
                      title="Issue reported"
                      description="The customer support team will respond to you shortly."
                    />
                  )
                });
                resetForm();
                onClose();
              }}
            >
              {({ handleSubmit, errors, touched, setFieldTouched }) => {
                return (
                  <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <VStack spacing={4} width="100%">
                      <FormControl
                        isInvalid={!!errors.description && touched.description}
                        pb="4"
                        isRequired
                      >
                        <FormLabel htmlFor="description" mb={1}>
                          Description
                        </FormLabel>
                        <Field
                          name="description"
                          as={Textarea}
                          placeholder="Describe issue with this order"
                          onBlur={() => setFieldTouched('description', true)}
                        />
                        <ErrorMessage name="description" component={FormErrorMessage} />
                      </FormControl>
                      <Button
                        px={6}
                        fontSize="md"
                        colorScheme="blue"
                        width="full"
                        type="submit"
                        disabled={loading}
                        isLoading={loading}
                      >
                        Report Issue
                      </Button>
                      <Button
                        px={6}
                        fontSize="md"
                        variant="ghost"
                        width="full"
                        onClick={() => {
                          onClose();
                        }}
                      >
                        Nevermind
                      </Button>
                    </VStack>
                  </Form>
                );
              }}
            </Formik>
          </VStack>
        </ModalBody>
        <ModalFooter px="0" />
      </ModalContent>
    </Modal>
  );
};
