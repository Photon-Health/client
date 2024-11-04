import { Button, Stack } from '@chakra-ui/react';

import { usePhoton } from '@photonhealth/react';
import { getSettings } from '@client/settings';

interface AuthProps {
  returnTo?: string;
}

export const Auth = (props: AuthProps) => {
  const { returnTo } = props;
  const { user, isLoading, isAuthenticated, login, logout } = usePhoton();
  const orgSettings = getSettings(user?.org_id);

  if (isLoading) return <Button isLoading loadingText="Loading" colorScheme="gray" />;

  if (isAuthenticated)
    return (
      <Stack direction="row" spacing={4}>
        <Button
          colorScheme="brand"
          onClick={() => {
            localStorage.removeItem('previouslyAuthed');
            logout({ returnTo: orgSettings.returnTo, federated: orgSettings.federated });
          }}
        >
          Log out
        </Button>
      </Stack>
    );

  return (
    <Button
      colorScheme="blue"
      onClick={() => login({ appState: { returnTo: window.location.origin + returnTo } })}
    >
      Log in
    </Button>
  );
};

Auth.defaultProps = { returnTo: '/' };
