import { Button, Stack } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';

import { usePhoton } from '@photonhealth/react';

interface AuthProps {
  returnTo?: string;
}

export const Auth = (props: AuthProps) => {
  const { returnTo } = props;
  const { isLoading, isAuthenticated, getToken, login, logout } = usePhoton();

  const getAccessToken = async () => {
    try {
      const token = await getToken();
      navigator.clipboard.writeText(token);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <Button isLoading loadingText="Loading" colorScheme="gray" />;

  if (isAuthenticated)
    return (
      <Stack direction="row" spacing={4}>
        <Button
          borderColor="blue.500"
          textColor="blue.500"
          colorScheme="blue"
          rightIcon={<CopyIcon />}
          variant="outline"
          onClick={getAccessToken}
        >
          Auth Token
        </Button>
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

Auth.defaultProps = { returnTo: '/' };
