import { useRef, useState } from 'react';

import { Alert, AlertIcon, Button } from '@chakra-ui/react';

import { useMutation } from '@apollo/client';
import { graphql } from 'apps/app/src/gql';
import { usePhoton } from '@photonhealth/react';
import usePermissions from 'apps/app/src/hooks/usePermissions';

interface RotateSecretProps {
  clientId: string;
  clientSecret?: string | null;
}

const rotateSecretMutation = graphql(/* GraphQL */ `
  mutation RotateSecret($clientId: ID!) {
    rotateClientSecret(clientId: $clientId) {
      id
    }
  }
`);

// The secret is rotated in Auth0 before this mutation returns, so a transport-level
// failure (a reset subgraph connection, a timeout) can reject after the live credential
// has already changed. Apollo skips `refetchQueries` when a mutation rejects, so the error
// path refetches explicitly — otherwise the card keeps showing a secret that no longer works.
const refetchQueries = ['ClientsDeveloperTabQuery'];

// The gateway surfaces a failed monolith subgraph fetch verbatim, e.g.
// "request to http://monolith-svc:4003/graphql failed, reason: socket hang up".
const isSubgraphTransportError = (message: string) => message.includes('monolith-svc');

export const RotateSecret = (props: RotateSecretProps) => {
  const { clientId, clientSecret } = props;
  const { clinicalClient } = usePhoton();
  // Wrapped so "no rotation attempted yet" (null) stays distinct from a null secret.
  const secretBeforeRotation = useRef<{ value?: string | null } | null>(null);
  // Held from the click until the secret on screen is known to be current. Apollo commits
  // its error state before `onError` runs, so without this the warning would render for a
  // frame and then disappear once the refetch lands.
  const [verifying, setVerifying] = useState(false);
  const [rotateSecret, { loading, error }] = useMutation(rotateSecretMutation, {
    refetchQueries,
    awaitRefetchQueries: true,
    client: clinicalClient,
    onCompleted: () => setVerifying(false),
    onError: async () => {
      try {
        await clinicalClient?.refetchQueries({ include: refetchQueries });
      } catch {
        // Nothing left to do — the alert below already tells the user to verify the secret
      } finally {
        setVerifying(false);
      }
    }
  });

  const hasWriteClient = usePermissions(['update:client_keys', 'write:client']);

  if (!hasWriteClient) {
    return null;
  }

  // A monolith transport failure on a rotation that demonstrably landed is noise: the
  // refetch above already put the new secret on screen, so there is nothing to act on.
  const rotationLanded =
    secretBeforeRotation.current !== null && clientSecret !== secretBeforeRotation.current.value;
  const suppressError = !!error && isSubgraphTransportError(error.message) && rotationLanded;

  return (
    <>
      <Button
        width="9em"
        colorScheme="red"
        size="sm"
        onClick={() => {
          secretBeforeRotation.current = { value: clientSecret };
          setVerifying(true);
          rotateSecret({ variables: { clientId } });
        }}
        disabled={loading || verifying}
      >
        Rotate Secret
      </Button>

      {error && !verifying && !suppressError && (
        <Alert status="warning">
          <AlertIcon />
          The rotation may have already gone through. Check the Client Secret above and update your
          integration if it changed — only retry if it did not. ({error.message})
        </Alert>
      )}
    </>
  );
};
