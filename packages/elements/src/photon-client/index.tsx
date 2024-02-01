import { customElement } from 'solid-element';
import { createEffect, createSignal, onMount } from 'solid-js';
import { PhotonClient, Env } from '@photonhealth/sdk';
import { SDKProvider } from '@photonhealth/components';
import { makeTimer } from '@solid-primitives/timer';
import { PhotonClientStore } from '../store';
import { hasAuthParams } from '../utils';
import { PhotonContext } from '../context';
import pkg from '../../package.json';
import { type User } from '@auth0/auth0-react';

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
  toastBuffer?: number;
  env?: Env;
  externalUserId?: string;
};

const version = pkg?.version ?? 'unknown';

customElement(
  'photon-client',
  {
    domain: {
      attribute: 'domain',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    id: {
      attribute: 'id',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    redirectUri: {
      attribute: 'redirect-uri',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    redirectPath: {
      attribute: 'redirect-path',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    org: {
      attribute: 'org',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    audience: {
      attribute: 'audience',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    uri: {
      attribute: 'uri',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    developmentMode: {
      attribute: 'dev-mode',
      value: false,
      reflect: true,
      notify: false,
      parse: true
    },
    errorMessage: {
      attribute: 'error-message',
      value: "Oh snap! There was an error loading. Please contact your site's administrator",
      reflect: false,
      notify: false,
      parse: false
    },
    autoLogin: {
      attribute: 'auto-login',
      value: false,
      reflect: false,
      notify: false,
      parse: true
    },
    env: {
      attribute: 'env',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    externalUserId: {
      attribute: 'userId',
      value: undefined,
      reflect: true,
      notify: true,
      parse: false
    }
  },
  (props: PhotonClientProps) => {
    let ref: any;
    const [sdk, setSDK] = createSignal<PhotonClient | undefined>(undefined);
    const [client, setClient] = createSignal<PhotonClientStore | undefined>(undefined);

    onMount(() => {
      if (props.developmentMode) {
        console.info('[PhotonClient]: Development mode enabled');
      }
      const _sdk = new PhotonClient(
        {
          env: props.env,
          domain: props.domain,
          audience: props.audience,
          uri: props.uri,
          clientId: props.id!,
          redirectURI: props.redirectUri ? props.redirectUri : window.location.origin,
          organization: props.org,
          developmentMode: props.developmentMode
        },
        version
      );

      const _client = new PhotonClientStore(sdk, props.autoLogin);
      setSDK(_sdk);
      setClient(_client);
    });

    const handleRedirect = async () => {
      await client()?.authentication.handleRedirect();
      if (props.redirectPath) window.location.replace(props.redirectPath);
    };

    const checkSession = async () => {
      await client()?.authentication.checkSession();
      makeTimer(
        async () => {
          await client()?.authentication.checkSession();
        },
        60000,
        setInterval
      );
    };

    createEffect(() => {
      if (hasAuthParams() && client()) {
        handleRedirect();
      } else if (client()) {
        checkSession();
      }
    });

    createEffect(() => {
      if (!client()?.authentication.state.isLoading) {
        // If autoLogin, then automatically log in
        if (!client()?.authentication.state.isAuthenticated && props.autoLogin) {
          const args: any = { appState: {} };
          if (props.redirectPath) {
            args.appState.returnTo = props.redirectPath;
          }
          client()?.authentication.login(args);
        } else if (
          // If `externalUserId` is set, then we check if it matches the logged in user
          // If it doesn't match then logout and then immediately log back in if possible
          props.externalUserId != null &&
          // Note that we check the last piece of the `sub` which is the id from the auth provider
          // We do an exact match on this last section because ids are not guaranteed to not be substrings of the other
          (client()?.authentication.state.user as User | undefined)?.sub
            ?.split('|')
            .reverse()[0] !== props.externalUserId
        ) {
          client()?.authentication.logout();
          const args: any = { appState: {} };
          if (props.redirectPath) {
            args.appState.returnTo = props.redirectPath;
          }
          client()?.authentication.login(args);
        }
      }
    });

    return (
      <div ref={ref}>
        <PhotonContext.Provider value={client()}>
          <SDKProvider client={sdk}>
            <slot />
          </SDKProvider>
        </PhotonContext.Provider>
      </div>
    );
  }
);
