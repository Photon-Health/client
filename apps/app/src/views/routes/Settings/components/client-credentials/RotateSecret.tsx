import { Alert, AlertIcon, Button } from '@chakra-ui/react';

import { useMutation } from '@apollo/client';
import { graphql } from 'apps/app/src/gql';
import { usePhoton } from 'packages/react';
import usePermissions from 'apps/app/src/hooks/usePermissions';

interface RotateSecretProps {
  clientId: string;
}

const rotateSecretMutation = graphql(/* GraphQL */ `
  mutation RotateSecret($clientId: ID!) {
    rotateClientSecret(clientId: $clientId) {
      id
    }
  }
`);

export const RotateSecret = (props: RotateSecretProps) => {
  const { clientId } = props;
  const { clinicalClient } = usePhoton();
  const [rotateSecret, { loading, error }] = useMutation(rotateSecretMutation, {
    refetchQueries: ['getClients', 'ClientsDeveloperTabQuery'],
    awaitRefetchQueries: true,
    client: clinicalClient
  });

  const hasWriteClient = usePermissions(['update:client_keys', 'write:client']);

  if (!hasWriteClient) {
    return null;
  }

  return (
    <>
      <Button
        width="9em"
        colorScheme="red"
        size="sm"
        onClick={() => rotateSecret({ variables: { clientId } })}
        disabled={loading}
      >
        Rotate Secret
      </Button>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}
    </>
  );
};
