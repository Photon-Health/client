import { PhotonClient } from '@photonhealth/sdk';
import { createContext, JSXElement, useContext } from 'solid-js';
import { Toaster } from 'solid-toast';

const SDKContext = createContext<PhotonClient>();

interface SDKProviderProps {
  client: PhotonClient;
  children: JSXElement;
  toastBuffer?: number;
}

export default function SDKProvider(props: SDKProviderProps) {
  return (
    <SDKContext.Provider value={props.client}>
      <Toaster
        containerStyle={{
          'margin-top': `${props?.toastBuffer || 0}px`
        }}
      />
      {props.children}
    </SDKContext.Provider>
  );
}

export function usePhotonClient() {
  return useContext(SDKContext);
}
