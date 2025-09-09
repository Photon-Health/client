import { Button, Stack } from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';

interface AuthProps {
  returnTo?: string;
}

export const Auth = ({ returnTo = '/' }: AuthProps) => {
  const { isLoading, isAuthenticated, login, logout } = usePhoton();

  if (isLoading) return <Button isLoading loadingText="Loading" colorScheme="gray" />;

  if (isAuthenticated)
    return (
      <Stack direction="row" spacing={4}>
        <Button
          colorScheme="brand"
          onClick={() => {
            localStorage.removeItem('previouslyAuthed');
            logout({ returnTo: window.location.origin });
          }}
        >
          Log out
        </Button>
      </Stack>
    );

  return (
    <Button colorScheme="blue" onClick={() => login({ appState: { returnTo } })}>
      Log in
    </Button>
  );
};
