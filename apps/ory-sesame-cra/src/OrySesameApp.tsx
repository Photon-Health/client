/* eslint-disable @typescript-eslint/no-unused-vars */
// import logo from "./logo.svg"
// import "./App.css"

import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { PhotonClient, PhotonProvider } from '@photonhealth/react';
import { ChangeEventHandler, useRef, useState } from 'react';
import { SesamePage } from './SesameWrapper';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-client': unknown;
      'photon-prescribe-workflow': unknown;
      'photon-auth-wrapper': unknown;
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

function App() {
  return (
    <div className="App">
      <PhotonProvider client={client}>
        <SesamePage>
          <Flex pr="10" h="100%" flexGrow={'1'}>
            <Box width="20%" bg={'green'}></Box>
            <Box flex="1">
              <photon-client
                id={clientId}
                org="org_qzo8REINlFXB5v24"
                domain={domain}
                audience={audience}
                uri={uri}
                auto-login="true"
              >
                <photon-prescribe-workflow />
              </photon-client>
            </Box>
          </Flex>
        </SesamePage>
      </PhotonProvider>
    </div>
  );
}

export default App;
