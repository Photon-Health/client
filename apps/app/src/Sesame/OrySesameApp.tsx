/* eslint-disable @typescript-eslint/no-unused-vars */
// import logo from "./logo.svg"
// import "./App.css"

import { Box, Flex, Button } from '@chakra-ui/react';
import { PhotonClient, PhotonProvider } from '@photonhealth/react';
import { SesamePage } from './SesameWrapper';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-client': unknown;
      'photon-prescribe-workflow': unknown;
      'photon-auth-wrapper': unknown;
      'photon-auth-button': unknown;
    }
  }
}

const domain = 'auth.boson.health';
const clientId = 'WoOY2q0gtrFuffz5WUQWlYiJ2iPGwWlp';
const redirectURI = window.location.origin;
const audience = 'https://api.boson.health';
const uri = 'https://api.boson.health/graphql';

const client = new PhotonClient({
  domain,
  clientId,
  redirectURI,
  audience,
  uri
});

export function SesameApp() {
  return (
    <div className="App">
      <PhotonProvider client={client}>
        <photon-client
          id={clientId}
          org="org_qzo8REINlFXB5v24"
          domain={domain}
          audience={audience}
          uri={uri}
        >
          <SesamePage>
            <Flex pr="10" h="100%" flexGrow={'1'}>
              <Box width="20%" bg={'green'}></Box>
              <Box flex="1">
                <photon-prescribe-workflow enable-order="true" />
              </Box>
            </Flex>
          </SesamePage>
        </photon-client>
      </PhotonProvider>
    </div>
  );
}

import { usePhoton } from '@photonhealth/react';

const LogoutButton = () => {
  const { logout, user } = usePhoton();
  return <Button onClick={() => logout({})}>Logout {JSON.stringify(user)}</Button>;
};
