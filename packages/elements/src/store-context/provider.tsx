import { PhotonClient } from '@photonhealth/sdk';
import { Accessor, JSXElement, createContext, createMemo, onMount, useContext } from 'solid-js';
import { AuthenticationWrapper, makeAuthentication } from './authentication';
import { ClinicalApiWrapper, makeClinical } from './clinical-api';
import { makeTimer } from '@solid-primitives/timer';

export const PhotonClientStoreContext = createContext<Accessor<PhotonClientStoreContextType>>();

interface PhotonClientStoreContextType {
  clinical: ClinicalApiWrapper;
  authentication: AuthenticationWrapper;
  getSDK: () => PhotonClient;
  autoLogin: boolean;
}

export const usePhotonWrapper = () => useContext(PhotonClientStoreContext);

export interface PhotonClientStoreProviderProps {
  sdk: PhotonClient;
  autoLogin: boolean;
  children: JSXElement;
}

export const PhotonClientStoreProvider = (props: PhotonClientStoreProviderProps) => {
  const value = createMemo(() => {
    const authentication = makeAuthentication(props.sdk);
    const clinical = makeClinical(props.sdk);
    const getSDK = () => props.sdk;

    return { authentication, clinical, getSDK, autoLogin: props.autoLogin };
  });

  onMount(() => {
    if (props.autoLogin || value().authentication.state.isAuthenticated) {
      // Load up first mount to populate the store
      value().authentication.checkSession();
    }
    // Keep checking the login every 60s
    makeTimer(
      async () => {
        if (props.autoLogin || value().authentication.state.isAuthenticated) {
          await value().authentication.checkSession();
        }
      },
      60000,
      setInterval
    );
  });

  return (
    <PhotonClientStoreContext.Provider value={value}>
      {props.children}
    </PhotonClientStoreContext.Provider>
  );
};
