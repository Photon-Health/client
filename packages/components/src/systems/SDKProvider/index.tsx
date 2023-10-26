import { PhotonClient } from '@photonhealth/sdk';
import { createContext, createEffect, createSignal, JSXElement, useContext } from 'solid-js';
import { Toaster } from 'solid-toast';

const SDKContext = createContext<PhotonClient>();

interface SDKProviderProps {
  client: PhotonClient;
  children: JSXElement;
}

export default function SDKProvider(props: SDKProviderProps) {
  const [navHeight, setNavHeight] = createSignal(0);

  createEffect(() => {
    // look to see if page has a nav or header element, if so use that to pad where the toast starts
    const navbar = document.querySelector('nav') || document.querySelector('header');

    if (navbar) {
      // Get the height of the navbar
      const height = navbar.getBoundingClientRect().height;

      // if the height is more than 150 it's probably not the navbar we're looking for
      if (height < 150) {
        console.log('setting nav height', height);
        setNavHeight(height);
      }
    }
  });

  return (
    <SDKContext.Provider value={props.client}>
      <Toaster
        containerStyle={{
          'margin-top': `${navHeight()}px` // hardcoded to fit the height of our clinical navbar
        }}
      />
      {props.children}
    </SDKContext.Provider>
  );
}

export function usePhotonClient() {
  return useContext(SDKContext);
}
