import { PhotonClient } from '@photonhealth/sdk';
import { createEffect, JSXElement } from 'solid-js';
import { PhotonContext } from '../../context';
import { PhotonClientStore } from '../../store';
import { makeTimer } from '@solid-primitives/timer';
import { hasAuthParams } from '../../utils/hasAuthParams';
import { createStore } from 'solid-js/store';

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
    ? new PhotonClientStore(sdk, props.createStore)
    : new PhotonClientStore(sdk);

  if (props.developmentMode) {
    console.info('[PhotonClient]: Development mode enabled');
  }

  let disposeInterval;
  createEffect(async () => {
    if (hasAuthParams() && store) {
      await store?.authentication.handleRedirect();
      if (props.redirectPath) window.location.replace(props.redirectPath);
    } else if (store) {
      await store?.authentication.checkSession();
      disposeInterval = makeTimer(
        async () => {
          await store?.authentication.checkSession();
        },
        60000,
        setInterval
      );
    }
  });

  createEffect(async () => {
    if (!store?.authentication.state.isLoading) {
      if (!store?.authentication.state.isAuthenticated && props.autoLogin) {
        const args: any = { appState: {} };
        if (props.redirectPath) {
          args.appState.returnTo = props.redirectPath;
        }
        await store?.authentication.login(args);
      }
    }
  }, [store?.authentication.state.isAuthenticated, store?.authentication.state.isLoading]);

  const Provider = props.context?.Provider || PhotonContext.Provider;

  return <Provider value={store}>{props.children}</Provider>;
}
