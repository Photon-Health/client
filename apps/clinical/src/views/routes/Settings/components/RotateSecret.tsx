import { Button, Alert, AlertIcon } from '@chakra-ui/react';

import { usePhoton } from '@photonhealth/react';

interface RotateSecretProps {
  clientId: string;
}

export const RotateSecret = (props: RotateSecretProps) => {
  const { clientId } = props;
  const { rotateSecret } = usePhoton();
  const [rotateSecretMutation, { loading, error }] = rotateSecret({
    refetchQueries: ['getClients'],
    awaitRefetchQueries: true
  });

  return (
    <>
      <Button
        width="9em"
        colorScheme="red"
        size="sm"
        onClick={() =>
          rotateSecretMutation({
            variables: {
              id: clientId
            }
          })
        }
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
