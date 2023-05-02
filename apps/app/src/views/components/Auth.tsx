import { Button, Stack } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';

import { usePhoton } from '@photonhealth/react';
import { getSettings } from '@client/settings';

const envName = process.env.REACT_APP_ENV_NAME as 'boson' | 'neutron' | 'photon';
const settings = getSettings(envName);

export const Auth = () => {
  const { user, isLoading, isAuthenticated, getToken, login, logout } = usePhoton();

  const orgSettings = user?.org_id in settings ? settings[user?.org_id] : settings.default;

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
      onClick={() => login({ appState: { returnTo: orgSettings.returnTo } })}
    >
      Log in
    </Button>
  );
};

Auth.defaultProps = { returnTo: '/' };
