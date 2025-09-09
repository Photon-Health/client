import { Button } from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';

interface AuthProps {
  returnTo?: string;
}

export const Auth = ({ returnTo = '/' }: AuthProps) => {
  const { isLoading, login } = usePhoton();

  if (isLoading) return <Button isLoading loadingText="Loading" colorScheme="gray" />;

  return (
    <Button colorScheme="blue" onClick={() => login({ appState: { returnTo } })}>
      Log in
    </Button>
  );
};
