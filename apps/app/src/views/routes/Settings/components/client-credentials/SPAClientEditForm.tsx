import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  Stack
} from '@chakra-ui/react';
import { useState } from 'react';

import { graphql } from 'apps/app/src/gql';
import { usePhoton } from '@photonhealth/react';
import { useMutation } from '@apollo/client';
import { ErrorMessage, Field, Formik } from 'formik';
import * as yup from 'yup';

const updateClientMutation = graphql(/* GraphQL */ `
  mutation UpdateClient($clientId: ID!, $whiteListedUrls: [String!]!) {
    updateClient(clientId: $clientId, whiteListedUrls: $whiteListedUrls) {
      id
    }
  }
`);

const spaClientValidationSchema = yup.object({
  whiteListedUrls: yup
    .string()
    .required('White Listed URLs are required')
    .test('urls', 'Must be comma separated valid URLs', (value) => {
      if (!value) return true;
      const urls = value.split(',').map((url) => url.trim());
      return urls.every((url) => {
        if (!url) return true;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
    })
});

type SPAClientEditFormValues = yup.InferType<typeof spaClientValidationSchema>;

interface SPAClientEditFormProps {
  clientId: string;
  whiteListedUrls: string[];
}

export function SPAClientEditForm({ clientId, whiteListedUrls }: SPAClientEditFormProps) {
  const { clinicalClient } = usePhoton();
  const [submitError, setSubmitError] = useState<string>();

  const [updateClient] = useMutation(updateClientMutation, {
    refetchQueries: ['ClientsDeveloperTabQuery'],
    client: clinicalClient
  });

  const initialValues: SPAClientEditFormValues = {
    whiteListedUrls: whiteListedUrls.join(', ')
  };

  const submitHandler = async (values: SPAClientEditFormValues) => {
    const urls = values.whiteListedUrls
      .split(',')
      .map((url) => url.trim())
      .filter((url) => !!url);

    try {
      const response = await updateClient({
        variables: {
          clientId,
          whiteListedUrls: urls
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
            <Button
              type="submit"
              size="sm"
              width="fit-content"
              isLoading={isSubmitting}
              isDisabled={isSubmitting || !dirty}
            >
              Update Whitelist
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
