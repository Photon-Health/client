import { PhotonClient } from '@photonhealth/sdk';
import { createEffect, JSXElement } from 'solid-js';
import { PhotonContext } from '../../context';
import { PhotonClientStore } from '../../store';
import { makeTimer } from '@solid-primitives/timer';
import { hasAuthParams } from '../../utils/hasAuthParams';

type ClientProps = {
  domain?: string;
  audience?: string;
  uri?: string;
  id?: string;
  redirectUri?: string;
  redirectPath?: string;
  org?: string;
  developmentMode?: boolean;
  autoLogin: boolean;
  children: JSXElement;
};

export default function Client({
  domain,
  id,
  redirectUri,
  redirectPath,
  org,
  developmentMode = false,
  audience,
  uri,
  autoLogin = false,
  children
}: ClientProps) {
  let ref: HTMLDivElement | undefined;

  const sdk = new PhotonClient({
    domain: domain,
    audience,
    uri,
    clientId: id!,
    redirectURI: redirectUri ? redirectUri : window.location.origin,
    organization: org,
    developmentMode: developmentMode
  });

  const store = new PhotonClientStore(sdk);

  if (developmentMode) {
    console.info('[PhotonClient]: Development mode enabled');
  }

  let disposeInterval;
  createEffect(async () => {
    if (hasAuthParams() && store) {
      await store?.authentication.handleRedirect();
      if (redirectPath) window.location.replace(redirectPath);
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
      if (!store?.authentication.state.isAuthenticated && autoLogin) {
        const args: any = { appState: {} };
        if (redirectPath) {
          args.appState.returnTo = redirectPath;
        }
        await store?.authentication.login(args);
      }
    }
  }, [store?.authentication.state.isAuthenticated, store?.authentication.state.isLoading]);

  return (
    <div ref={ref}>
      <PhotonContext.Provider value={store}>{children}</PhotonContext.Provider>
    </div>
  );
}
