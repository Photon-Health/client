import {
  Alert,
  AlertIcon,
  Box,
  Container,
  Divider,
  SkeletonText,
  Stack,
  Text
} from '@chakra-ui/react';

import { useQuery } from '@apollo/client';
import { graphql } from 'apps/app/src/gql';
import { formatAddress } from 'apps/app/src/utils';
import { useMemo } from 'react';
import InfoGrid from '../../../components/InfoGrid';
import { usePhoton } from '@photonhealth/react';

const profileQuery = graphql(/* GraphQL */ `
  query MeProfileQuery {
    me {
      name {
        full
      }
      email
      phone
      npi
      address {
        street1
        street2
        city
        state
        postalCode
        country
      }
    }
    organization {
      id
      name
    }
  }
`);

export const Profile = () => {
  const { clinicalClient } = usePhoton();
  const { data, loading, error } = useQuery(profileQuery, {
    client: clinicalClient,
    errorPolicy: 'ignore'
  });

  const address = useMemo(() => {
    const addressData = data?.me.address;
    if (!addressData) {
      return undefined;
    }
    return formatAddress(addressData);
  }, [data?.me.address?.street1]);

  const rows = useMemo(
    () =>
      [
        { title: 'Full Name', value: data?.me?.name?.full },
        { title: 'Organization', value: data?.organization?.name },
        { title: 'Email Address', value: data?.me?.email },
        { title: 'Phone', value: data?.me.phone },
        { title: 'Address', value: address },
        { title: 'NPI', value: data?.me.npi }
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
    [data?.me, data?.organization, address]
  );

  return (
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
        <Stack spacing={2}>
          <Text fontSize="xl" fontWeight="medium">
            Profile
          </Text>
          <Divider />
          {error && (
            <Alert status="error">
              <AlertIcon />
              There was an error getting your user details
            </Alert>
          )}
          <Stack spacing={4}>
            <Text color="muted" fontSize="sm">
              These are the basic profile details associated with your logged in user.{' '}
            </Text>
            {rows.map(({ title, value }) => (
              <InfoGrid key={title} name={title}>
                {loading ? <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" /> : value}
              </InfoGrid>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
