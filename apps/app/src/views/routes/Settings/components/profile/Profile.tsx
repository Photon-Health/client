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
  Text,
  useToast
} from '@chakra-ui/react';

import { useMutation, useQuery } from '@apollo/client';
import { CheckIcon, EditIcon } from '@chakra-ui/icons';
import { graphql } from 'apps/app/src/gql';
import usePermissions from 'apps/app/src/hooks/usePermissions';
import InfoGrid from 'apps/app/src/views/components/InfoGrid';
import { Formik } from 'formik';
import { useMemo, useState } from 'react';
import * as yup from 'yup';
import { Role } from 'packages/sdk/dist/types';
import { usePhoton } from '@photonhealth/react';
import { ProfileForm, profileFormSchema } from './ProfileEditForm';
import { formatAddress } from 'apps/app/src/utils';

const profileQuery = graphql(/* GraphQL */ `
  query MeProfileQuery {
    me {
      id
      npi
      phone
      fax
      email
      address {
        street1
        street2
        state
        postalCode
        country
        city
      }
      name {
        first
        full
        last
        middle
        title
      }
      roles {
        description
        id
        name
      }
    }
    organization {
      id
      name
    }
  }
`);

const updateMyProfileMutation = graphql(/* GraphQL */ `
  mutation UpdateMyProfile($updateMyProfileInput: ProfileInput!) {
    updateMyProfile(input: $updateMyProfileInput)
  }
`);

function mapAndSortRoles(roles: Role[]): { value: string; label: string; description?: string }[] {
  const mappedRoles = roles.map(({ name, id, description }) => ({
    value: id,
    label: name ?? id,
    description: description ?? undefined
  }));
  const sortedRoles = mappedRoles.sort();
  return sortedRoles;
}

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

export const Profile = () => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const { clinicalClient } = usePhoton();
  const { data, loading, error } = useQuery(profileQuery, {
    client: clinicalClient,
    errorPolicy: 'ignore'
  });
  const [updateMyProfile, { loading: mutationLoading }] = useMutation(updateMyProfileMutation, {
    refetchQueries: ['MeProfileQuery'],
    client: clinicalClient
  });

  const handleSaveRoles = (formVariables: any) => {
    updateMyProfile({
      variables: {
        updateMyProfileInput: {
          name: formVariables.variables.name ?? user?.name,
          address: formVariables.variables.provider.address ?? user?.address,
          email: formVariables.variables.email ?? user?.email,
          npi: formVariables.variables.provider.npi ?? user?.npi,
          phone: formVariables.variables.provider.phone ?? user?.phone,
          fax: formVariables.variables.fax ?? user?.fax
        }
      }
    });
  };

  const hasOrgEdit = usePermissions(['edit:profile']);
  const user = data?.me;
  const organization = data?.organization;

  const initialValues: yup.InferType<typeof profileFormSchema> = {
    name: {
      title: user?.name?.title ?? undefined,
      first: user?.name?.first ?? '',
      middle: user?.name?.middle ?? undefined,
      last: user?.name?.last ?? ''
    },
    fax: user?.fax ?? undefined,
    email: user?.email ?? '',
    roles: mapAndSortRoles(user?.roles ?? []),
    provider: {
      npi: user?.npi ?? '',
      address: {
        street1: user?.address?.street1 ?? '',
        street2: user?.address?.street2 ?? undefined,
        city: user?.address?.city ?? '',
        state: {
          value: (user?.address?.state as string) ?? ''
        },
        postalCode: user?.address?.postalCode ?? ''
      },
      phone: user?.phone ?? ''
    }
  };
  const address = useMemo(() => {
    const addressData = user?.address;
    if (!addressData) {
      return undefined;
    }
    return formatAddress(addressData);
  }, [user?.address?.street1]);

  const rows = useMemo(
    () =>
      [
        { title: 'Full Name', value: user?.name?.full },
        { title: 'Organization', value: organization?.name },
        { title: 'Email Address', value: user?.email },
        { title: 'Phone', value: user?.phone },
        { title: 'Fax', value: user?.fax },
        { title: 'Address', value: address },
        { title: 'NPI', value: user?.npi }
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
    [user, organization, address]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={profileFormSchema}
      enableReinitialize // if organization changes so should this form
      onSubmit={async (values, { validateForm, resetForm }) => {
        try {
          await validateForm(values);
          await handleSaveRoles({
            variables: {
              name: {
                first: values.name.first,
                title: values.name.title ?? undefined,
                middle: values.name.middle ?? undefined,
                last: values.name.last
              },
              fax: values.fax ?? undefined,
              email: values.email,
              roles: values.roles,
              ...(values.provider == null
                ? {}
                : {
                    provider: {
                      ...values.provider,
                      address: {
                        ...values.provider.address,
                        street1: values.provider.address.street1,
                        street2: values.provider.address.street2 ?? undefined,
                        state: values?.provider?.address?.state?.value ?? '',
                        country: 'US'
                      }
                    }
                  })
            }
          });
          toast({
            title: 'Profile updated',
            status: 'success',
            duration: 4000
          });
          resetForm();
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
                  Profile details
                </Text>
                <HStack>
                  {user && isEditing ? (
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
                  There was an error processing your request for profile details.
                </Alert>
              )}
              {user && formikProps && isEditing ? (
                <ProfileForm {...formikProps} />
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
