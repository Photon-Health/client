import { customElement } from 'solid-element';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { Env, PhotonClient } from '@photonhealth/sdk';
import type { LoginOptions } from '@photonhealth/sdk';
import {
  AnalyticsEventListener,
  GoogleServiceProvider,
  PhotonClientStore,
  PhotonContext,
  SDKProvider
} from '@photonhealth/components';
import { makeTimer } from '@solid-primitives/timer';
import queryString from 'query-string';
import { hasAuthParams } from '../utils';
import pkg from '../../package.json';
import { type User } from '@auth0/auth0-react';

export type PhotonClientProps = {
  domain?: string;
  audience?: string;
  connection?: string;
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
  emitUserToken?: boolean;
  /* Pass extra properties when photon-client is rendered in our web app */
  appAnalyticsProperties?: Record<string, unknown>;
};

const version = pkg?.version ?? 'unknown';

/**
 * Hosts pass `user-id` as either the bare provider id (`abc123`) or the whole
 * Auth0 `sub` (`auth0|abc123`), so accept both. The last `|`-delimited segment
 * is compared exactly, since provider ids can be substrings of one another.
 */
export const matchesExternalUserId = (sub: string | undefined, externalUserId: string): boolean => {
  if (!sub) return false;
  return sub === externalUserId || sub.split('|').reverse()[0] === externalUserId;
};

const errorStyles = {
  padding: '12px 16px',
  margin: '8px 0',
  border: '1px solid #fecaca',
  'border-radius': '6px',
  background: '#fef2f2',
  color: '#991b1b',
  'font-family': 'system-ui, -apple-system, sans-serif',
  'font-size': '14px',
  'line-height': '1.4'
} as const;

export const PhotonClientComponent = (props: PhotonClientProps) => {
  let ref: any;

  const baseRedirectURI = props.redirectUri ? props.redirectUri : window.location.origin;
  // In order to distinguish our requests from a potential other Auth0 instance on the same domain
  // we add a query parameter to the redirect URI
  const redirectURI = queryString.stringifyUrl({
    url: baseRedirectURI,
    query: { photon: true }
  });

  const sdk = new PhotonClient(
    {
      env: props.env,
      domain: props.domain,
      audience: props.audience,
      connection: props.connection,
      uri: props.uri,
      clientId: props.id!,
      redirectURI,
      organization: props.org,
      developmentMode: props.developmentMode
    },
    version
  );
  const client = new PhotonClientStore(sdk, props.autoLogin);
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

  // Guards the redirects below. Each ends in a full-page navigation, so a
  // second one while another is in flight is always either a duplicate or a
  // race — and the user switch below used to be exactly that race.
  let authTransitionInFlight = false;

  const loginArgs = (extra: LoginOptions = {}): LoginOptions => ({
    appState: props.redirectPath ? { returnTo: props.redirectPath } : {},
    ...extra
  });

  const switchUser = async () => {
    authTransitionInFlight = true;
    try {
      // Clear the local session *without* navigating. Logging out through Auth0
      // and immediately logging back in fired two competing navigations; when
      // the login won, the session was never actually cleared.
      await store()?.authentication.logout({ openUrl: false });
      // The SSO cookie would otherwise hand back the same user, so a genuine
      // mismatch could never resolve and the effect would fire forever.
      // prompt=login forces Auth0 to re-authenticate.
      await store()?.authentication.login(loginArgs({ prompt: 'login' }));
    } catch (error) {
      // Leaving authTransitionInFlight set is deliberate: a failed switch must
      // not fall back into retrying, which is the loop.
      console.error('[PhotonClient]: Unable to switch user', error);
    }
  };

  createEffect(() => {
    const authState = store()?.authentication.state;
    if (!authState || authState.isLoading) return;

    // A surfaced error means the session could not be established or used.
    // Redirecting again is the loop — leave the message standing instead.
    if (authState.error) return;
    if (authTransitionInFlight) return;

    if (!authState.isAuthenticated) {
      // `externalUserId` is a request for a *specific* user to be signed in, so
      // it warrants a login even when autoLogin is off — which is what the old
      // logout-then-login branch did here, incidentally.
      if (props.autoLogin || props.externalUserId != null) {
        authTransitionInFlight = true;
        store()?.authentication.login(loginArgs());
      }
      return;
    }

    // If `externalUserId` is set, check it matches the logged in user; if not,
    // swap to the requested one.
    if (
      props.externalUserId != null &&
      !matchesExternalUserId((authState.user as User | undefined)?.sub, props.externalUserId)
    ) {
      switchUser();
    }
  });

  createEffect(() => {
    const isAuthenticated = store()?.authentication.state.isAuthenticated;
    const isLoading = store()?.authentication.state.isLoading;
    if (props.emitUserToken && isAuthenticated && !isLoading) {
      sdk.authentication
        // Emitting the token is a convenience for the host app; a failure here
        // must not navigate the page out from under it.
        .getAccessToken({ redirectOnFailure: false })
        .then((token) => {
          ref?.dispatchEvent(
            new CustomEvent('photon-user-token', {
              composed: true,
              bubbles: true,
              detail: { token }
            })
          );
        })
        .catch((error) => {
          console.warn('[PhotonClient]: Unable to emit user token', error);
        });
    }
  });

  const authError = createMemo(() => store()?.authentication.state.error);

  return (
    <div ref={ref}>
      {/* Without this, a refused login is a blank screen plus a console
          message — the loop at least gave the user something to look at. */}
      <Show when={authError()}>
        <div role="alert" style={errorStyles}>
          {authError()}
        </div>
      </Show>
      <PhotonContext.Provider value={store()}>
        <GoogleServiceProvider>
          <SDKProvider client={sdk}>
            <AnalyticsEventListener
              clientRef={ref}
              appAnalyticsProperties={props.appAnalyticsProperties}
            >
              <slot />
            </AnalyticsEventListener>
          </SDKProvider>
        </GoogleServiceProvider>
      </PhotonContext.Provider>
    </div>
  );
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
    connection: {
      attribute: 'connection',
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
      attribute: 'user-id',
      value: undefined,
      reflect: true,
      notify: true,
      parse: false
    },
    emitUserToken: {
      attribute: 'emit-user-token',
      value: false,
      reflect: false,
      notify: false,
      parse: true
    },
    appAnalyticsProperties: {
      attribute: 'app-analytics-properties',
      value: undefined,
      reflect: false,
      notify: false,
      parse: true
    }
  },
  PhotonClientComponent
);
