import { PhotonClient } from '@photonhealth/sdk';
import { createEffect, JSXElement } from 'solid-js';
import { PhotonContext } from '../../context';
import { PhotonClientStore } from '../../store';
import { makeTimer } from '@solid-primitives/timer';
import { hasAuthParams } from '../../utils/hasAuthParams';
import { createStore } from 'solid-js/store';
import SDKProvider from '../SDKProvider';

type ClientProps = {
  domain?: string;
  audience?: string;
  uri?: string;
  id?: string;
  redirectUri?: string;
  redirectPath?: string;
  org?: string;
  developmentMode?: boolean;
  autoLogin?: boolean;
  children?: JSXElement;
  context?: any;
  createStore?: typeof createStore;
};

export default function Client(props: ClientProps) {
  const sdk = new PhotonClient({
    domain: props.domain,
    audience: props.audience,
    uri: props.uri,
    clientId: props.id!,
    redirectURI: props.redirectUri ? props.redirectUri : window.location.origin,
    organization: props.org,
    developmentMode: props.developmentMode
  });

  const store = props?.createStore
    ? new PhotonClientStore(sdk, props.autoLogin ?? false, props.redirectPath, props.createStore)
    : new PhotonClientStore(sdk, props.autoLogin ?? false, props.redirectPath);

  if (props.developmentMode) {
    console.info('[PhotonClient]: Development mode enabled');
  }

  createEffect(async () => {
    if (hasAuthParams() && store) {
      await store?.authentication.handleRedirect();
      if (props.redirectPath) window.location.replace(props.redirectPath);
    } else if (store) {
      await store?.authentication.checkSession();
      makeTimer(
        async () => {
          await store?.authentication.checkSession();
        },
        60000,
        setInterval
      );
    }
  });

  const Provider = props.context?.Provider || PhotonContext.Provider;

  return (
    <Provider value={store}>
      <SDKProvider client={sdk}>{props.children}</SDKProvider>
    </Provider>
  );
}
