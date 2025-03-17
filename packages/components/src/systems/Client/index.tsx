import { Env, PhotonClient } from '@photonhealth/sdk';
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
  connection?: string;
  env?: Env;
};

export default function Client(props: ClientProps) {
  const sdk = new PhotonClient({
    domain: props.domain,
    audience: props.audience,
    uri: props.uri,
    clientId: props.id!,
    redirectURI: props.redirectUri ? props.redirectUri : window.location.origin,
    organization: props.org,
    developmentMode: props.developmentMode,
    connection: props.connection,
    env: props.env ?? getEnv(props)
  });

  const store = props?.createStore
    ? new PhotonClientStore(sdk, props.createStore)
    : new PhotonClientStore(sdk);

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
  });

  const Provider = props.context?.Provider || PhotonContext.Provider;

  return (
    <Provider value={store}>
      <SDKProvider client={sdk}>{props.children}</SDKProvider>
    </Provider>
  );
}

function getEnv(props: ClientProps): Env {
  const isEnv = (env: Env) =>
    props.domain?.includes(env) || props.audience?.includes(env) || props.uri?.includes(env);

  if (isEnv('tau')) {
    return 'tau';
  }
  if (isEnv('boson')) {
    return 'boson';
  }
  if (isEnv('neutron')) {
    return 'neutron';
  }

  return 'photon';
}
