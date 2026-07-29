import {
  Auth0Client,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  LogoutOptions as Auth0LogoutOptions,
  RedirectLoginOptions,
  User
} from '@auth0/auth0-spa-js';
import { clearLoginAttempts, guardLoginAttempt } from './loginLoopGuard';

const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

/**
 * Query params belonging to an Auth0 redirect. Stripped from any URL we ask
 * Auth0 to return us to, so a consumed authorization code can't be replayed
 * into `handleRedirect` on arrival (which fails with "Invalid state" and, with
 * autoLogin on, starts the whole flow again).
 */
const AUTH_REDIRECT_PARAMS = [
  'code',
  'state',
  'error',
  'error_description',
  'error_uri',
  'iss',
  'photon'
];

/**
 * Auth0 error codes that mean "there is definitively no session, log in".
 * Everything else — iframe timeouts, network failures, org mismatches — leaves
 * the session state *unknown*, and must not be reported as logged out: callers
 * with autoLogin enabled respond to "logged out" by redirecting to login, which
 * is how a transient failure becomes an infinite loop.
 */
const NO_SESSION_ERROR_CODES = ['login_required'];

/**
 * Configuration options for AuthManager
 * @param authentication An instaniated Auth0 Client
 * @param organization An id of an organization to login as
 * @param audience The top-level domain of the Photon API
 * @param clientId The Auth0 client id, used to scope login-loop bookkeeping
 */
export interface AuthManagerOptions {
  authentication: Auth0Client;
  organization?: string;
  audience?: string;
  connection?: string;
  clientId?: string;
}

/**
 * Configuration options for login
 * @param organizationId An id of an organization to login as
 * @param invitation An Auth0 invitation string
 * @param appState State to pass Auth0, which will be restored on redirect. Useful for redirecting back to the same page after login
 * @param prompt Auth0 `prompt` param. Pass `login` to force re-authentication instead of silently reusing the existing SSO session
 * @param loginHint Auth0 `login_hint` param, pre-filling the identity to authenticate as
 */
export interface LoginOptions {
  organizationId?: string;
  invitation?: string;
  connection?: string;
  appState?: object;
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
  loginHint?: string;
}

/**
 * Configuration options for logout
 * @param returnTo Where to redirect after logging out
 * @param openUrl Pass `false` to clear the local session without navigating to Auth0's logout endpoint. Useful when the caller intends to immediately redirect somewhere else itself, since two competing navigations race
 */
export interface LogoutOptions {
  returnTo?: string;
  federated?: boolean;
  openUrl?: false | ((url: string) => void | Promise<void>);
}

/**
 * Configuration options for getAccessToken
 * @param audience Audience to specify on the retrieved access token
 * @param redirectOnFailure When silent token acquisition fails, redirect the whole page to Auth0 to re-establish the session. Defaults to `true`, preserving session-expiry recovery. Pass `false` from background or polling callers, so a transient failure cannot navigate the user away
 */
export interface GetAccessTokenOptions {
  audience?: string;
  redirectOnFailure?: boolean;
}

/** Outcome of probing the current session. */
export type SessionProbe =
  | { status: 'authenticated' }
  | { status: 'unauthenticated' }
  | { status: 'indeterminate'; error: Error };

function auth0ErrorCode(error: unknown): string | undefined {
  const code = (error as { error?: unknown } | undefined)?.error;
  return typeof code === 'string' ? code : undefined;
}

function isNoSessionError(error: unknown): boolean {
  const code = auth0ErrorCode(error);
  if (code) return Boolean(NO_SESSION_ERROR_CODES.find((c) => c === code));
  const message = (error as Error | undefined)?.message ?? '';
  return NO_SESSION_ERROR_CODES.some((known) => message.includes(known));
}

/**
 * Removes Auth0 redirect params while preserving the host app's own query
 * string, which callers rely on to restore state after a session expires.
 */
export function stripAuthParams(search: string): string {
  if (!search) return '';
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  AUTH_REDIRECT_PARAMS.forEach((param) => params.delete(param));
  const remaining = params.toString();
  return remaining ? `?${remaining}` : '';
}

/**
 * Contains various methods for authentication (Auth0)
 */
export class AuthManager {
  private authentication: Auth0Client;

  private organization?: string;

  private audience?: string;

  private connection?: string;

  private clientId?: string;

  /**
   * @param config - Photon AuthManager configuration options
   * @remarks - Note, that organization is optional for scenarios in which a provider supports more than themselves.
   */
  constructor({
    authentication,
    organization,
    audience = 'https://api.photon.health',
    connection,
    clientId
  }: AuthManagerOptions) {
    this.authentication = authentication;
    this.organization = organization;
    this.audience = audience;
    this.connection = connection;
    this.clientId = clientId;
  }

  /**
   * Performs a login against the specified Auth0 domain
   * @param config - Login configuration
   * @remarks Throws {@link LoginLoopError} when too many login redirects have
   * happened in quick succession, rather than adding another to the pile.
   * @returns
   */
  public async login({
    organizationId,
    invitation,
    connection,
    appState,
    prompt,
    loginHint
  }: LoginOptions): Promise<void> {
    const opts: RedirectLoginOptions<any> = {
      authorizationParams: {
        ...(this.audience ? { audience: this.audience } : {}),
        ...(connection || this.connection ? { connection: connection || this.connection } : {}),
        ...(organizationId || this.organization
          ? { organization: organizationId || this.organization }
          : {}),
        ...(invitation ? { invitation } : {}),
        ...(prompt ? { prompt } : {}),
        ...(loginHint ? { login_hint: loginHint } : {})
      },
      ...(appState ? { appState } : {})
    };

    guardLoginAttempt(this.clientId);

    return this.authentication.loginWithRedirect(opts);
  }

  /**
   * Performs a logout against the specified Auth0 domain
   * @param config - Logout configuration
   * @returns
   */
  public async logout({ returnTo, federated = false, openUrl }: LogoutOptions): Promise<void> {
    const opts: Auth0LogoutOptions = {
      logoutParams: {
        ...(returnTo ? { returnTo } : {}),
        ...(federated ? { federated } : {})
      },
      ...(openUrl !== undefined ? { openUrl } : {})
    };

    return this.authentication.logout(opts);
  }

  /**
   * Determines if URL has Auth0 parameters
   * @returns boolean
   */
  public hasAuthParams(searchParams = window.location.search): boolean {
    return (
      (CODE_RE.test(searchParams) || ERROR_RE.test(searchParams)) && STATE_RE.test(searchParams)
    );
  }

  private _getAccessToken = async ({
    audience,
    redirectOnFailure = true
  }: GetAccessTokenOptions = {}): Promise<string> => {
    const opts: GetTokenSilentlyOptions | GetTokenWithPopupOptions = {
      authorizationParams: {
        audience: audience || this.audience || undefined,
        ...(this.organization ? { organization: this.organization } : {})
      }
    };

    try {
      const token = await this.authentication.getTokenSilently(opts);
      if (!token) throw new Error('Auth0 returned an empty access token');
      return token;
    } catch (error) {
      if ((error as Error)?.message?.includes('Consent required')) {
        const token = await this.authentication.getTokenWithPopup(opts);
        // A dismissed or blocked consent popup resolves empty rather than
        // throwing, so fall through to the same handling as any other failure.
        if (token) return token;
      }

      // Previously every failure here was swallowed and turned into a
      // full-page login redirect. That made an expired session
      // indistinguishable from a blocked silent-auth iframe or an org
      // mismatch, and let background callers (the session poll) navigate the
      // user away once a minute. Now the reason always propagates, and only
      // callers that opt in get the redirect.
      if (!redirectOnFailure) throw error;

      await this.loginWithRedirectPreservingLocation(opts);
      throw error;
    }
  };

  /**
   * Re-establishes the session, returning the user to where they are now.
   * Auth0 redirect params are stripped from that destination so the arriving
   * page doesn't try to re-exchange a spent authorization code.
   */
  private async loginWithRedirectPreservingLocation(opts: GetTokenSilentlyOptions): Promise<void> {
    if (typeof window === 'undefined') return;

    const redirectOpts: RedirectLoginOptions = {
      ...opts,
      appState: {
        returnTo: `${window.location.pathname}${stripAuthParams(window.location.search)}`
      }
    };

    guardLoginAttempt(this.clientId);

    await this.authentication.loginWithRedirect(redirectOpts);
  }

  /**
   * Retrieves a valid access token
   * @param config - getAccessToken configuration
   * @returns
   */
  public async getAccessToken(
    { audience, redirectOnFailure }: GetAccessTokenOptions = {
      audience: this.audience
    }
  ): Promise<string> {
    return await this._getAccessToken({
      audience: audience ?? this.audience,
      redirectOnFailure
    });
  }

  /**
   * Retrieves a valid access token
   * @param config - getAccessToken configuration
   * @returns
   */
  public async getAccessTokenWithConsent(
    { audience }: { audience?: string } = {
      audience: this.audience
    }
  ): Promise<string | undefined> {
    const opts: GetTokenWithPopupOptions = {
      authorizationParams: {
        audience: audience || this.audience || undefined,
        ...(this.organization ? { organization: this.organization } : {})
      }
    };

    return this.authentication.getTokenWithPopup(opts);
  }

  /**
   * Silently performs a getAccessToken and pre-populates the token and user information caches
   * @returns
   */
  public async checkSession(): Promise<void> {
    const opts = {
      authorizationParams: {
        audience: this.audience || undefined,
        ...(this.organization ? { organization: this.organization } : {})
      }
    };

    return this.authentication.checkSession(opts);
  }

  /**
   * Establishes whether there is a usable session, distinguishing "no session"
   * from "could not tell". Prefer this over {@link isAuthenticated} anywhere
   * the answer decides whether to trigger a login, since reporting a transient
   * failure as logged out is what produces login loops.
   */
  public async probeSession(): Promise<SessionProbe> {
    try {
      await this.checkSession();
    } catch (error) {
      if (isNoSessionError(error)) return { status: 'unauthenticated' };
      return { status: 'indeterminate', error: error as Error };
    }

    return (await this.authentication.isAuthenticated())
      ? { status: 'authenticated' }
      : { status: 'unauthenticated' };
  }

  /**
   * Handes Auth0 redirect after login
   * @param url - The url which contains the code and state parameters (defaults to window.location.href)
   * @returns
   */
  public async handleRedirect(url?: string) {
    try {
      // Must be awaited inside the try. Returning the promise un-awaited meant
      // a rejected exchange bypassed this catch entirely, so the failure was
      // never logged here and surfaced only as an opaque rejection upstream.
      return await this.authentication.handleRedirectCallback(url);
    } catch (error) {
      console.error('[PhotonClient]: Failed to complete the Auth0 redirect.', error);
      throw error;
    }
  }

  /**
   * Marks the current session as successfully established, resetting
   * login-loop bookkeeping. Call once a session has been not just obtained but
   * used, since obtaining one is the part that already works when looping.
   */
  public confirmSessionEstablished(): void {
    clearLoginAttempts(this.clientId);
  }

  /**
   * Retrieves information about the currently authenticated user
   * @returns
   */
  public async getUser(): Promise<User | undefined> {
    return this.authentication.getUser();
  }

  /**
   * Determines whether or not a user is currently logged in
   * @returns
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      await this.authentication.checkSession();
      return await this.authentication.isAuthenticated();
    } catch (_error) {
      return false;
    }
  }
}
