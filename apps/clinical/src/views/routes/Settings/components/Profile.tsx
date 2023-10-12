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

import { usePhoton } from '@photonhealth/react';
import { SimpleTable } from '../../../components/SimpleTable';

export const Profile = () => {
  const { user, isLoading, getOrganization } = usePhoton();
  const { organization, loading, error } = getOrganization();

  const renderSkeletonRow = (isMobile: boolean | undefined) =>
    isMobile
      ? {
          title: <Skeleton width="150px" height="20px" />,
          value: <Skeleton width="150px" height="20px" />
        }
      : {
          title: <Skeleton width="300px" height="20px" />,
          value: <Skeleton width="300px" height="20px" />
        };

  const isMobile = useBreakpointValue({ base: true, md: false });
  const skeletonRows = new Array(4).fill(0).map(() => renderSkeletonRow(isMobile));

  const rows = [
    {
      title: 'Full Name',
      value: user?.name
    },
    {
      title: 'Email Address',
      value: user?.email
    },
    {
      title: 'Organization Name',
      value: organization?.name
    },
    {
      title: 'Organization ID',
      value: organization?.id
    }
  ];

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
      py={{ base: '4', md: '8' }}
      px={{ base: '4', md: '8' }}
      borderRadius="lg"
      bg="bg-surface"
      boxShadow="base"
      w="full"
    >
      <Container padding={{ base: '0', md: '0' }}>
        <Stack>
          <Text fontSize="xl" fontWeight="medium">
            Profile
          </Text>
          <Divider />
          {error && (
            <Alert status="error">
              <AlertIcon />
              There was an error processing your request for organization details
            </Alert>
          )}
          <Text color="muted" fontSize="md">
            These are the basic profile details associated with your logged in user.{' '}
          </Text>
          <SimpleTable
            data={loading ? skeletonRows : rows}
            columns={columns}
            loading={loading || isLoading}
            hideHeaders
            useLoadingOverlay={false}
          />
        </Stack>
      </Container>
    </Box>
  );
};
