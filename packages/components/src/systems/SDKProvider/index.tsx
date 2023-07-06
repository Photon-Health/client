import { PhotonClient } from '@photonhealth/sdk';
import { createContext, JSXElement, useContext } from 'solid-js';

const SDKContext = createContext<PhotonClient>();

interface SDKProviderProps {
  client: PhotonClient;
  children: JSXElement;
}

export default function SDKProvider(props: SDKProviderProps) {
  return <SDKContext.Provider value={props.client}>{props.children}</SDKContext.Provider>;
}

export function usePhotonClient() {
  return useContext(SDKContext);
}
