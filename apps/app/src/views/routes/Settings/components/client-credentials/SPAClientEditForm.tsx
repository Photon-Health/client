import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  Stack,
  FormHelperText,
  Flex,
  Switch,
  Text
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';

import { graphql } from 'apps/app/src/gql';
import { usePhoton } from '@photonhealth/react';
import { useMutation } from '@apollo/client';
import { ErrorMessage, Field, Formik } from 'formik';
import * as yup from 'yup';
import { Client } from 'apps/app/src/gql/graphql';

const updateClientMutation = graphql(/* GraphQL */ `
  mutation UpdateClient($clientId: ID!, $whiteListedUrls: [String!]!, $connections: [String!]!) {
    updateClient(
      clientId: $clientId
      whiteListedUrls: $whiteListedUrls
      connections: $connections
    ) {
      id
    }
  }
`);

const spaClientValidationSchema = yup.object({
  whiteListedUrls: yup
    .string()
    .test('urls', 'Must be valid comma separated URLs with no query parameters', (value) => {
      if (!value) return true;
      const urls = value.split(',').map((url) => url.trim());
      return urls.every((item) => {
        if (!item) return true;
        let url = item;
        // if the Url has a wildcard in the subdomain
        if (url.includes('://*.')) {
          url = url.replace('://*.', '://WILDCARD.');
        }

        try {
          const urlObject = new URL(url);
          if (!urlObject.protocol || !urlObject.hostname) return false;
          if (urlObject.searchParams.size > 0) return false;
          return true;
        } catch {
          return false;
        }
      });
    }),
  googleAuthEnabled: yup.boolean().required(),
  microsoftAuthEnabled: yup.boolean().required()
});

type SPAClientEditFormValues = yup.InferType<typeof spaClientValidationSchema>;

interface SPAClientEditFormProps {
  clientId: string;
  whiteListedUrls: string[];
  connections: Client['connections'];
}

export function SPAClientEditForm({
  clientId,
  whiteListedUrls,
  connections
}: SPAClientEditFormProps) {
  const { clinicalClient } = usePhoton();
  const [submitError, setSubmitError] = useState<string>();

  const [updateClient] = useMutation(updateClientMutation, {
    refetchQueries: ['ClientsDeveloperTabQuery'],
    client: clinicalClient
  });

  const initialValues: SPAClientEditFormValues = useMemo(
    () => ({
      whiteListedUrls: whiteListedUrls.join(', '),
      googleAuthEnabled:
        connections?.some((connection) => connection.name === 'google-oauth2') ?? false,
      microsoftAuthEnabled:
        connections?.some((connection) => connection.name === 'Microsoft') ?? false
    }),
    [connections, whiteListedUrls]
  );

  const submitHandler = async (values: SPAClientEditFormValues) => {
    const connections: string[] = [];
    const urls = (values.whiteListedUrls ?? '')
      .split(',')
      .map((url) => url.trim())
      .filter((url) => !!url);

    if (values.googleAuthEnabled) {
      connections.push('google-oauth2');
    }
    if (values.microsoftAuthEnabled) {
      connections.push('Microsoft');
    }

    try {
      const response = await updateClient({
        variables: {
          clientId,
          whiteListedUrls: urls,
          connections
        }
      });
      if (response.errors?.length) {
        throw new Error(response.errors[0].message);
      }
      setSubmitError(undefined);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setSubmitError('Failed to update whitelist');
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={spaClientValidationSchema}
      onSubmit={submitHandler}
      enableReinitialize
    >
      {({ values, errors, dirty, isSubmitting, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.whiteListedUrls}>
              <FormLabel htmlFor="whiteListedUrls">Whitelisted URLs</FormLabel>
              <FormHelperText marginBottom={2}>
                Enter URLs with no query parameters. Must begin with https://
              </FormHelperText>
              <Field
                as={Textarea}
                id="whiteListedUrls"
                name="whiteListedUrls"
                rows={5}
                value={values.whiteListedUrls}
                placeholder="https://example.com, https://dev.example.com"
              />
              <ErrorMessage name="whiteListedUrls" component={FormErrorMessage} />
            </FormControl>
            <Stack spacing={2}>
              <Text fontSize="sm" fontWeight="medium">
                SSO Options
              </Text>
              <Flex gap={4} justifyContent="flex-start" alignItems="center">
                <FormControl w="fit-content">
                  <Flex gap={2}>
                    <Field
                      as={Switch}
                      id="googleAuthEnabled"
                      name="googleAuthEnabled"
                      isChecked={values.googleAuthEnabled}
                    />
                    <FormLabel cursor="pointer" htmlFor="googleAuthEnabled">
                      Google OAuth
                    </FormLabel>
                  </Flex>
                </FormControl>
                <FormControl w="fit-content">
                  <Flex gap={2}>
                    <Field
                      as={Switch}
                      id="microsoftAuthEnabled"
                      name="microsoftAuthEnabled"
                      isChecked={values.microsoftAuthEnabled}
                    />
                    <FormLabel cursor="pointer" htmlFor="microsoftAuthEnabled">
                      Microsoft OAuth
                    </FormLabel>
                  </Flex>
                </FormControl>
              </Flex>
            </Stack>
            <Button
              type="submit"
              size="sm"
              width="fit-content"
              isLoading={isSubmitting}
              isDisabled={isSubmitting || !dirty}
            >
              Update Client
            </Button>
            {submitError && (
              <Alert status="error">
                <AlertIcon />
                {submitError}
              </Alert>
            )}
          </Stack>
        </form>
      )}
    </Formik>
  );
}
