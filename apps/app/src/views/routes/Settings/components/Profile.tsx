import {
  Alert,
  AlertIcon,
  Box,
  Container,
  Divider,
  Skeleton,
  Stack,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';

import { useQuery } from '@apollo/client';
import { graphql } from 'apps/app/src/gql';
import { useMemo } from 'react';
import { SimpleTable } from '../../../components/SimpleTable';
import { useClinicalApiClient } from '../apollo';
import { formatAddress } from 'apps/app/src/utils';

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
  const client = useClinicalApiClient();
  const { data, loading, error } = useQuery(profileQuery, { client, errorPolicy: 'ignore' });

  const renderSkeletonRow = (isMobile: boolean | undefined) =>
    isMobile
      ? {
          title: <Skeleton width="150px" height="24px" />,
          value: <Skeleton width="150px" height="24px" />
        }
      : {
          title: <Skeleton width="300px" height="24px" />,
          value: <Skeleton width="300px" height="24px" />
        };

  const isMobile = useBreakpointValue({ base: true, md: false });
  const skeletonRows = new Array(4).fill(0).map(() => renderSkeletonRow(isMobile));

  const address = useMemo(() => {
    const addressData = data?.me.address;
    if (!addressData) {
      return undefined;
    }
    return formatAddress(addressData);
  }, [data?.me.address?.street1]);

  const rows = useMemo(
    () => [
      { title: 'Full Name', value: data?.me?.name?.full },
      { title: 'Organization', value: data?.organization?.name },
      { title: 'Email Address', value: data?.me?.email },
      { title: 'Phone', value: data?.me.phone },
      { title: 'Address', value: address },
      { title: 'NPI', value: data?.me.npi }
    ],
    [data?.me, data?.organization, address]
  );

  const columns = [
    {
      Header: 'Titles',
      accessor: 'title',
      width: 'wrap'
    },
    {
      Header: 'Values',
      accessor: 'value'
    }
  ];

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
          <Text color="muted" fontSize="sm">
            These are the basic profile details associated with your logged in user.{' '}
          </Text>
          <SimpleTable
            data={loading ? skeletonRows : rows}
            columns={columns}
            loading={loading}
            hideHeaders
            useLoadingOverlay={false}
          />
        </Stack>
      </Container>
    </Box>
  );
};
