import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  SkeletonText,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react';

import { useMutation, useQuery } from '@apollo/client';
import { CheckIcon, EditIcon } from '@chakra-ui/icons';
import { graphql } from 'apps/app/src/gql';
import { OrgType } from 'apps/app/src/gql/graphql';
import usePermissions from 'apps/app/src/hooks/usePermissions';
import InfoGrid from 'apps/app/src/views/components/InfoGrid';
import { Formik } from 'formik';
import { useMemo, useState } from 'react';
import * as yup from 'yup';
import { useClinicalApiClient } from '../../../../../clinicalApollo';
import { OrganizationForm, organizationFormSchema } from './OrganizationEditForm';

const organizationQuery = graphql(/* GraphQL */ `
  query OrganizationQuery {
    organization {
      id
      name
      address {
        street1
        street2
        postalCode
        city
        state
        country
      }
      fax
      phone
      email
    }
  }
`);

const updateOrganizationMutation = graphql(/* GraphQL */ `
  mutation UpdateOrganization($input: OrganizationInput!) {
    updateOrganization(input: $input)
  }
`);

const EditButtons = ({
  onSave,
  onCancel,
  loading
}: {
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) => (
  <>
    <Button
      size={'sm'}
      colorScheme={'green'}
      leftIcon={loading ? <Spinner size={'xs'} /> : <CheckIcon />}
      isDisabled={loading}
      disabled={loading}
      onClick={onSave}
    >
      Save
    </Button>
    <Button
      size={'sm'}
      color="red.400"
      borderColor={'red.400'}
      variant="outline"
      onClick={onCancel}
      isDisabled={loading}
      disabled={loading}
    >
      Cancel
    </Button>
  </>
);

export const Organization = () => {
  const [isEditing, setIsEditing] = useState(false);
  const client = useClinicalApiClient();
  const { data, error, loading } = useQuery(organizationQuery, { client });
  const [updateOrganization, { loading: mutationLoading }] = useMutation(
    updateOrganizationMutation,
    {
      refetchQueries: ['OrganizationQuery'],
      client
    }
  );
  const hasOrgEdit = usePermissions(['manage:organization']);
  const organization = data?.organization;

  const initialValues: yup.InferType<typeof organizationFormSchema> = {
    id: organization?.id ?? '',
    name: organization?.name ?? '',
    email: organization?.email ?? '',
    fax: organization?.fax ?? '',
    phone: organization?.phone ?? '',
    address: {
      street1: organization?.address?.street1 ?? '',
      street2: organization?.address?.street2 ?? '',
      postalCode: organization?.address?.postalCode ?? '',
      state: { value: organization?.address?.state ?? '' },
      city: organization?.address?.city ?? ''
    }
  };

  const address = useMemo(() => {
    const addressData = organization?.address;
    if (!addressData) {
      return undefined;
    }
    return `${addressData.street1} ${addressData.street2 ? `${addressData.street2} ` : ''}${
      addressData.city
    }, ${addressData.state} ${addressData.postalCode}`;
  }, [organization?.address?.street1]);

  const rows = useMemo(
    () =>
      [
        { title: 'Organization Name', value: organization?.name },
        { title: 'Email', value: organization?.email },
        { title: 'Fax', value: organization?.fax },
        { title: 'Phone', value: organization?.phone },
        { title: 'Address', value: address },
        { title: 'Organization ID', value: organization?.id }
      ].map(({ title, value }) => ({
        title,
        value: value ? (
          <Text fontSize="sm">{value}</Text>
        ) : (
          <Text fontSize="sm" color="gray.400" as="i">
            Not available
          </Text>
        )
      })),
    [
      organization,
      organization?.id,
      organization?.name,
      organization?.address,
      organization?.email,
      organization?.fax,
      organization?.phone
    ]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={organizationFormSchema}
      enableReinitialize // if organization changes so should this form
      onSubmit={async (values) => {
        try {
          await updateOrganization({
            variables: {
              input: {
                name: values.name,
                email: values.email ?? '', // TODO: make email not required
                fax: values.fax ?? '', // TODO: make fax not required
                phone: values.phone ?? '', // TODO: make phone not required
                type: OrgType.Prescriber,
                address: { ...values.address, country: 'USA', state: values.address.state.value }
              }
            }
          });
        } catch (e) {
          console.error('Failed to update', e);
        }
        setIsEditing(false);
      }}
    >
      {(formikProps) => (
        <Box
          pt={{ base: '4', md: '4' }}
          pb={{ base: '4', md: '8' }}
          px={{ base: '4', md: '8' }}
          borderRadius="lg"
          bg="bg-surface"
          boxShadow="base"
          w="full"
        >
          <Container padding={{ base: '0', md: '0' }}>
            <Stack spacing={3}>
              <Flex justifyContent={'space-between'}>
                <Text fontSize="xl" fontWeight="medium">
                  Organization details
                </Text>
                <HStack>
                  {isEditing ? (
                    <EditButtons
                      loading={mutationLoading}
                      onSave={formikProps.submitForm}
                      onCancel={() => {
                        formikProps.resetForm();
                        setIsEditing(false);
                      }}
                    />
                  ) : hasOrgEdit ? (
                    <Button
                      size={'sm'}
                      colorScheme={'brand'}
                      leftIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit details
                    </Button>
                  ) : null}
                </HStack>
              </Flex>
              <Divider />
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  There was an error processing your request for organization details.
                </Alert>
              )}
              {isEditing ? (
                <OrganizationForm {...formikProps} />
              ) : (
                rows.map(({ title, value }) => (
                  <InfoGrid key={title} name={title}>
                    {loading ? (
                      <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
                    ) : (
                      value
                    )}
                  </InfoGrid>
                ))
              )}
            </Stack>
          </Container>
        </Box>
      )}
    </Formik>
  );
};
