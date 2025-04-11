import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Flex,
  HStack,
  Stack,
  Text,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { Formik } from 'formik';
import { useMutation, useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';

import { graphql } from 'apps/app/src/gql';
import { OrganizationSettingsForm } from './OrganizationSettingsForm';
import { OrganizationSettings as OrganizationSettingsType } from 'apps/app/src/gql/graphql';
import {
  createInitialOrgSettingsFormValues,
  organizationSettingsFormSchema,
  OrganizationSettingsFormValues
} from './utils';

const organizationSettingsQuery = graphql(/* GraphQL */ `
  query OrganizationSettingsQuery {
    organization {
      settings {
        id
        organizationId
        brandColor
        brandLogo
        supportContactAdmin
        supportName
        supportEmail
        enableRxClarificationSupport
        rxClarificationContactProvider
        rxClarificationContactAdmin
        rxClarificationName
        rxClarificationEmail
        enablePriorAuthorizationSupport
        priorAuthorizationContactProvider
        priorAuthorizationContactAdmin
        priorAuthorizationName
        priorAuthorizationEmail
        priorAuthorizationExceptionMessage
        providerUx {
          enablePrescriberOrdering
          enablePrescribeToOrder
          enableRxTemplates
          enableDuplicateRxWarnings
          enableTreatmentHistory
          enablePatientRouting
          enablePickupPharmacies
          enableDeliveryPharmacies
        }
        patientUx {
          enablePatientRerouting
          enablePatientDeliveryPharmacies
          patientFeaturedPharmacyName
        }
      }
    }
  }
`);

const updateOrganizationSettingsMutation = graphql(/* GraphQL */ `
  mutation UpdateOrganizationSettings($input: OrganizationSettingsInput!) {
    updateOrganizationSettings(input: $input) {
      id
    }
  }
`);

export function OrganizationSettings() {
  const { clinicalClient } = usePhoton();
  const [error, setError] = useState<string | null>(null);

  const { data, loading } = useQuery(organizationSettingsQuery, { client: clinicalClient });
  const [updateOrganizationSettings, { loading: mutationLoading }] = useMutation(
    updateOrganizationSettingsMutation,
    {
      refetchQueries: ['OrganizationSettingsQuery'],
      client: clinicalClient
    }
  );

  const initialValues: OrganizationSettingsFormValues = useMemo(() => {
    const settings: OrganizationSettingsType =
      data?.organization?.settings ?? ({} as OrganizationSettingsType);
    return createInitialOrgSettingsFormValues(settings);
  }, [data?.organization?.settings]);

  if (loading || !data?.organization?.settings)
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <CircularProgress isIndeterminate />
      </Flex>
    );

  return (
    <Box p={{ base: '4', md: '8' }} borderRadius="lg" bg="white" boxShadow="base" w="full">
      <Container padding={{ base: '0', md: '0' }}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={organizationSettingsFormSchema}
          onSubmit={async (vals: OrganizationSettingsFormValues) => {
            try {
              await updateOrganizationSettings({
                variables: {
                  input: vals
                }
              });
            } catch (error) {
              console.error(error);
              const message = error instanceof Error ? error.message : 'Unknown error';
              setError('Failed to update organization settings:\n' + message);
            }
          }}
        >
          {({ handleSubmit, values, errors, setFieldValue }) => {
            return (
              <Stack spacing={3}>
                <Flex justifyContent={'space-between'}>
                  <Text fontSize="xl" fontWeight="medium">
                    Organization Settings
                  </Text>
                  <HStack>
                    <Button size="sm" onClick={() => handleSubmit()} isLoading={mutationLoading}>
                      Update
                    </Button>
                  </HStack>
                </Flex>
                <Divider />
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                <OrganizationSettingsForm
                  values={values}
                  errors={errors}
                  setFieldValue={setFieldValue}
                />
              </Stack>
            );
          }}
        </Formik>
      </Container>
    </Box>
  );
}
