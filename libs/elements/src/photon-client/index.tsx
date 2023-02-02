import { customElement } from 'solid-element';
import { createEffect, createSignal } from 'solid-js';
import { PhotonContext } from '../context';
import { hasAuthParams, validateProps } from '../utils';
import { PhotonClient } from '@photonhealth/sdk';
import { PhotonClientStore } from '../store';
import { makeTimer } from '@solid-primitives/timer';

type PhotonClientProps = {
  domain?: string;
  audience?: string;
  uri?: string;
  id?: string;
  redirectUri?: string;
  redirectPath?: string;
  org?: string;
  developmentMode?: boolean;
  errorMessage?: string;
  autoLogin: boolean;
};

customElement(
  'photon-client',
  {
    domain: {
      attribute: 'domain',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false,
    },
    id: {
      attribute: 'id',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false,
    },
    redirectUri: {
      attribute: 'redirect-uri',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false,
    },
    redirectPath: {
      attribute: 'redirect-path',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false,
    },
    org: {
      attribute: 'org',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false,
    },
    audience: {
      attribute: 'audience',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false,
    },
    uri: {
      attribute: 'uri',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false,
    },
    developmentMode: {
      attribute: 'dev-mode',
      value: false,
      reflect: true,
      notify: false,
      parse: true,
    },
    errorMessage: {
      attribute: 'error-message',
      value: "Oh snap! There was an error loading. Please contact your site's administrator",
      reflect: false,
      notify: false,
      parse: false,
    },
    autoLogin: {
      attribute: 'auto-login',
      value: false,
      reflect: false,
      notify: false,
      parse: true,
    },
  },
  ({
    domain,
    id,
    redirectUri,
    redirectPath,
    org,
    developmentMode,
    errorMessage,
    audience,
    uri,
    autoLogin,
  }: PhotonClientProps) => {
    let ref: any;
    const errs = validateProps({ id }, ['id']);

    const sdk = new PhotonClient({
      domain: domain,
      audience,
      uri,
      clientId: id!,
      redirectURI: redirectUri ? redirectUri : window.location.origin,
      organization: org,
      developmentMode: developmentMode,
    });
    const client = new PhotonClientStore(sdk);
    if (developmentMode) {
      console.info('[PhotonClient]: Development mode enabled');
    }
    const [store] = createSignal<PhotonClientStore>(client);

    let disposeInterval;
    createEffect(async () => {
      if (hasAuthParams() && store()) {
        await store()?.authentication.handleRedirect();
        if (redirectPath) window.location.replace(redirectPath);
      } else if (store()) {
        await store()?.authentication.checkSession();
        disposeInterval = makeTimer(
          async () => {
            await store()?.authentication.checkSession();
          },
          60000,
          setInterval
        );
      }
    });
    createEffect(async () => {
      if (!store()?.authentication.state.isLoading) {
        if (!store()?.authentication.state.isAuthenticated && autoLogin) {
          const args: any = { appState: {} };
          if (redirectPath) {
            args.appState.returnTo = redirectPath;
          }
          await store()?.authentication.login(args);
        }
      }
    }, [store()?.authentication.state.isAuthenticated, store()?.authentication.state.isLoading]);

    return (
      <div ref={ref}>
        <PhotonContext.Provider value={store()}>
          <slot></slot>
        </PhotonContext.Provider>
      </div>
    );
  }
);
