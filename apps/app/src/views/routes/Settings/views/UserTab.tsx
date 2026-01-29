import { Spinner, VStack } from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { graphql } from 'apps/app/src/gql';
import { Profile } from '../components/profile/Profile';

export const UserTab = () => {
  const { clinicalClient } = usePhoton();
  const { data, loading, error } = useQuery(profileQuery, {
    client: clinicalClient,
    errorPolicy: 'ignore'
  });

  const user = data?.me;
  const organization = data?.organization;

  if (!user) {
    return loading ? <Spinner size="sm" /> : <p>Failed to load user.</p>;
  }

  return (
    <VStack spacing={5} align="left">
      <Profile user={user} organization={organization} loading={loading} error={error} />
    </VStack>
  );
};

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
