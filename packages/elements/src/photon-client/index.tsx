import { customElement } from 'solid-element';
import { createEffect, createSignal } from 'solid-js';
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

    const sdk = new PhotonClient(
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
    const client = new PhotonClientStore(sdk, props.autoLogin, props.redirectPath);
    if (props.developmentMode) {
      console.info('[PhotonClient]: Development mode enabled');
    }
    const [store] = createSignal<PhotonClientStore>(client);

    const handleRedirect = async () => {
      await store()?.authentication.handleRedirect();
      if (props.redirectPath) window.location.replace(props.redirectPath);
    };

    const checkSession = async () => {
      await store()?.authentication.checkSession();
      makeTimer(
        async () => {
          await store()?.authentication.checkSession();
        },
        60000,
        setInterval
      );
    };

    createEffect(() => {
      if (hasAuthParams() && store()) {
        handleRedirect();
      } else if (store()) {
        checkSession();
      }
    });

    createEffect(() => {
      if (!store()?.authentication.state.isLoading && props.externalUserId != null) {
        if (
          (store().authentication.state.user as User).sub?.split('|').reverse()[0] !==
          props.externalUserId
        ) {
          store()?.authentication.logout();
          const args: any = { appState: {} };
          if (props.redirectPath) {
            args.appState.returnTo = props.redirectPath;
          }
          store()?.authentication.login(args);
        }
      }
    });

    return (
      <div ref={ref}>
        <PhotonContext.Provider value={store()}>
          <SDKProvider client={sdk}>
            <slot />
          </SDKProvider>
        </PhotonContext.Provider>
      </div>
    );
  }
);
