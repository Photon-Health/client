import { SDKProvider } from '@photonhealth/components';
import { Env, PhotonClient } from '@photonhealth/sdk';
import { customElement } from 'solid-element';
import { JSXElement, createEffect } from 'solid-js';
import { hasAuthParams } from '../utils';
import { type User } from '@auth0/auth0-react';
import pkg from '../../package.json';
import { PhotonClientStoreProvider, usePhotonWrapper } from '../store-context';

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

const PhotonClientComponent = (props: PhotonClientComponentProps) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const photon = usePhotonWrapper()!;

  const handleRedirect = async () => {
    await photon()?.authentication.handleRedirect();
    if (props.redirectPath) window.location.replace(props.redirectPath);
  };

  createEffect(() => {
    if (hasAuthParams()) {
      handleRedirect();
    }
  });

  createEffect(() => {
    const args: { appState: { returnTo?: string } } = { appState: {} };
    if (props.redirectPath) {
      args.appState.returnTo = props.redirectPath;
    }
    if (!photon()?.authentication.state.isLoading) {
      // If autoLogin, then automatically log in
      if (!photon()?.authentication.state.isAuthenticated && props.autoLogin) {
        photon()?.authentication.login(args);
      } else if (
        // If `externalUserId` is set, then we check if it matches the logged in user
        // If it doesn't match then logout and then immediately log back in if possible
        props.externalUserId != null &&
        // Note that we check the last piece of the `sub` which is the id from the auth provider
        // We do an exact match on this last section because ids are not guaranteed to not be substrings of the other
        (photon().authentication.state.user as User | undefined)?.sub?.split('|').reverse()[0] !==
          props.externalUserId
      ) {
        photon()?.authentication.logout();
        photon()?.authentication.login(args);
      }
    }
  });

  return <>{props.children}</>;
};

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
    if (props.developmentMode) {
      console.info('[PhotonClient]: Development mode enabled');
    }

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

    return (
      <div ref={ref}>
        <PhotonClientStoreProvider sdk={sdk} autoLogin={props.autoLogin}>
          <SDKProvider client={sdk}>
            <PhotonClientComponent
              redirectPath={props.redirectPath}
              autoLogin={props.autoLogin}
              externalUserId={props.externalUserId}
            >
              <slot />
            </PhotonClientComponent>
          </SDKProvider>
        </PhotonClientStoreProvider>
      </div>
    );
  }
);

interface PhotonClientComponentProps {
  redirectPath: string | undefined;
  externalUserId: string | undefined;
  autoLogin: boolean;
  children: JSXElement;
}
