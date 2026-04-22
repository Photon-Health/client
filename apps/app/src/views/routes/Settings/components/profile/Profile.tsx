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
import { Formik, validateYupSchema, yupToFormErrors } from 'formik';
import { useMemo, useState } from 'react';
import * as yup from 'yup';
import { Role } from 'packages/sdk/dist/types';
import { usePhoton } from '@photonhealth/react';
import { ProfileForm, profileFormSchema } from './ProfileEditForm';
import { formatAddress } from 'apps/app/src/utils';
import { StyledToast } from 'apps/app/src/views/components/StyledToast';
import { compact } from 'lodash';

const updateMyProfileMutation = graphql(/* GraphQL */ `
  mutation UpdateMyProfile($updateMyProfileInput: ProviderProfileInput!) {
    updateMyProfile(input: $updateMyProfileInput)
  }
`);

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

  const user = data?.me;
  const organization = data?.organization;

  const hasEditProfile = usePermissions(['edit:profile']);
  const hasEditProfileSelf = usePermissions(['edit:profile_self']);
  const canEdit = hasEditProfile || hasEditProfileSelf;

  const initialValues: yup.InferType<typeof profileFormSchema> = {
    name: {
      title: user?.name?.title ?? undefined,
      first: user?.name?.first ?? '',
      middle: user?.name?.middle ?? undefined,
      last: user?.name?.last ?? ''
    },
    email: user?.email ?? '',
    roles: mapAndSortRoles(user?.roles ?? []),
    phone: user?.phone ?? '',
    fax: user?.fax ?? '',
    npi: user?.npi ?? '',
    address: {
      street1: user?.address?.street1 ?? '',
      street2: user?.address?.street2 ?? undefined,
      city: user?.address?.city ?? '',
      state: {
        value: (user?.address?.state as string) ?? ''
      },
      postalCode: user?.address?.postalCode ?? ''
    }
  };

  const address = useMemo(() => {
    const addressData = user?.address;
    if (!addressData) {
      return undefined;
    }
    return formatAddress(addressData);
  }, [user?.address]);

  const orgNameMatchesUserName =
    user &&
    organization &&
    organization?.name.toLowerCase() !==
      `${user.name?.first.toLowerCase()} ${user.name?.last.toLowerCase()}`;

  const rows = useMemo(
    () =>
      compact([
        { title: 'Full Name', value: formatName(user?.name, user?.credentials) },
        orgNameMatchesUserName && {
          title: 'Organization',
          value: organization?.name
        },
        { title: 'Email Address', value: user?.email },
        { title: 'Phone', value: user?.phone },
        { title: 'Fax', value: user?.fax },
        { title: 'Address', value: address },
        { title: 'NPI', value: user?.npi }
      ]).map(({ title, value }) => ({
        title,
        value: value ? (
          <Text fontSize="sm" data-dd-privacy="mask" className="mp-mask">
            {value}
          </Text>
        ) : (
          <Text fontSize="sm" color="gray.400" as="i">
            Not available
          </Text>
        )
      })),
    [
      user?.name,
      user?.credentials,
      user?.email,
      user?.phone,
      user?.fax,
      user?.npi,
      orgNameMatchesUserName,
      organization?.name,
      address
    ]
  );

  const handleSubmit = async (values: yup.InferType<typeof profileFormSchema>) => {
    try {
      await updateMyProfile({
        variables: {
          updateMyProfileInput: {
            name: {
              first: values.name.first,
              title: values.name.title ?? undefined,
              middle: values.name.middle ?? undefined,
              last: values.name.last
            },
            address: {
              ...values.address,
              street1: values.address.street1 ?? '',
              street2: values.address.street2 ?? undefined,
              city: values?.address?.city ?? '',
              postalCode: values?.address?.postalCode ?? '',
              state: values?.address?.state?.value ?? '',
              country: 'US'
            },
            email: values.email,
            npi: values.npi,
            phone: values.phone,
            fax: values.fax
          }
        }
      });
      toast({
        position: 'top-right',
        duration: 4000,
        render: ({ onClose }) => (
          <StyledToast onClose={onClose} type="success" description="Profile updated" />
        )
      });
    } catch (e) {
      console.error('Failed to update', e);
    }
    setIsEditing(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={(value) => {
        try {
          validateYupSchema(value, profileFormSchema, true, { initialValues });
        } catch (err) {
          return yupToFormErrors(err);
        }
        return {};
      }}
      enableReinitialize // if organization changes so should this form
      onSubmit={handleSubmit}
    >
      {(formikProps) => (
        <Box p={{ base: '4', md: '8' }} borderRadius="lg" bg="white" boxShadow="base" w="full">
          <Container padding={{ base: '0', md: '0' }}>
            <Stack spacing={3}>
              <Flex justifyContent={'space-between'}>
                <Text fontSize="xl" fontWeight="medium">
                  Profile details
                </Text>
                <HStack>
                  {isEditing ? (
                    <EditButtons
                      loading={mutationLoading}
                      isInvalid={!formikProps.isValid}
                      onSave={formikProps.submitForm}
                      onCancel={() => {
                        formikProps.resetForm();
                        setIsEditing(false);
                      }}
                    />
                  ) : canEdit ? (
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
              {isEditing ? (
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

const EditButtons = ({
  onSave,
  onCancel,
  loading,
  isInvalid
}: {
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  isInvalid: boolean;
}) => (
  <>
    <Button
      size={'sm'}
      colorScheme={'green'}
      leftIcon={loading ? <Spinner size={'xs'} /> : <CheckIcon />}
      isDisabled={loading || isInvalid}
      disabled={loading || isInvalid}
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

function mapAndSortRoles(roles: Role[]): { value: string; label: string; description?: string }[] {
  const mappedRoles = roles.map(({ name, id, description }) => ({
    value: id,
    label: name ?? id,
    description: description ?? undefined
  }));
  const sortedRoles = mappedRoles.sort();
  return sortedRoles;
}

function formatName(
  name:
    | {
        __typename?: 'Name';
        first: string;
        full: string;
        last: string;
        middle?: string | null;
        title?: string | null;
      }
    | null
    | undefined,
  credentials?: string | null
): string {
  if (!name) return '';
  const { first, middle, last, title } = name;
  const parts: string[] = [];
  if (first) parts.push(first.trim());
  if (middle) parts.push(middle.trim());
  if (last) parts.push(last.trim());
  let fullName = parts.join(' ');

  if (title && ALLOWED_TITLES.has(title.trim().toLowerCase())) {
    fullName = `${formatDoctorTitle(title)} ${fullName}`;
  }

  if (credentials && credentials.trim()) {
    fullName += `, ${credentials.trim().toUpperCase()}`;
  }

  return fullName;
}

const ALLOWED_TITLES = new Set(['dr', 'dr.']);
function formatDoctorTitle(title: string): string {
  const normalized = title.trim().toLowerCase().replace(/\.$/, '');
  const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return `${capitalized}.`;
}

const profileQuery = graphql(/* GraphQL */ `
  query MeProfileQuery {
    me {
      id
      npi
      phone
      fax
      email
      credentials
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
