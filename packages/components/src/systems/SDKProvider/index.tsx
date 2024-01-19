import { PhotonClient } from '@photonhealth/sdk';
import { createContext, createEffect, JSXElement, Ref, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

const SDKContext = createContext<{ client: PhotonClient; ref: Ref<any> | undefined }>();

interface SDKProviderProps {
  client: PhotonClient;
  children: JSXElement;
}

export default function SDKProvider(props: SDKProviderProps) {
  let ref: Ref<any> | undefined;
  const [store, setStore] = createStore({
    client: props.client,
    ref
  });

  createEffect(() => {
    setStore({ client: props.client, ref });
  });

  return (
    <SDKContext.Provider value={store}>
      <div ref={ref}>{props.children}</div>
    </SDKContext.Provider>
  );
}

export function usePhotonClient() {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('usePhotonClient must be used within a SDKProvider');
  }
  return context;
}
