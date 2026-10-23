import {
  Auth0Client,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  LogoutOptions as Auth0LogoutOptions,
  RedirectLoginOptions,
  User
} from '@auth0/auth0-spa-js';

const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

/**
 * Query params belonging to an Auth0 redirect.
 *
 * These have to be removed from the URL once a redirect has been handled —
 * successfully or not. While they remain, `hasAuthParams()` keeps reporting
 * true, so every subsequent page load re-runs the same authorization code
 * exchange instead of checking the existing session. A spent code fails that
 * exchange forever, and the app can never recover on its own.
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
 * Removes Auth0 redirect params while preserving the host app's own query
 * string, which consumers rely on surviving a login round trip.
 */
export function stripAuthParams(search: string): string {
  if (!search) return '';
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  AUTH_REDIRECT_PARAMS.forEach((param) => params.delete(param));
  const remaining = params.toString();
  return remaining ? `?${remaining}` : '';
}

/**
 * Thrown instead of redirecting when the previous login redirect, made moments
 * ago, came back without a usable session. Redirecting again would only repeat
 * it: Auth0 has a session, but this browser can't hand it to us (no third-party
 * cookies for the silent iframe, no cached refresh token), so every round trip
 * ends the same way. Callers should surface it rather than log in again.
 */
export class LoginLoopError extends Error {
  public constructor() {
    super('Unable to complete sign in. Allow cookies for the Photon login page, then try again.');
    this.name = 'LoginLoopError';
  }
}

/**
 * How recent a previous automatic login redirect must be for another one to
 * count as a loop. A round trip through Auth0 with an existing session takes a
 * few seconds; a user coming back to an expired session takes far longer.
 */
const LOGIN_LOOP_WINDOW_MS = 30_000;

/**
 * Once a loop is detected, how long automatic redirects stay off. Longer than
 * the periodic session checks in Elements (every 60s), so they can't restart
 * the loop at a slower pace; short enough that a later visit to the page in
 * the same tab logs in normally.
 */
const LOGIN_LOOP_BACKOFF_MS = 10 * 60_000;

const LOGIN_ATTEMPT_KEY = 'photon:login-redirect-at';
const LOGIN_BLOCKED_KEY = 'photon:login-blocked-until';

// sessionStorage can throw (sandboxed iframes, some private modes). Without it
// the loop breaker is off, which is no worse than before it existed.
function readTimestamp(key: string): number | undefined {
  try {
    const value = Number(window.sessionStorage.getItem(key));
    return value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

function writeTimestamp(key: string, value: number): void {
  try {
    window.sessionStorage.setItem(key, String(value));
  } catch {
    // See readTimestamp.
  }
}

/** Whether an automatic login redirect now would repeat a loop. */
function isLoginLoop(): boolean {
  const now = Date.now();
  const blockedUntil = readTimestamp(LOGIN_BLOCKED_KEY);
  if (blockedUntil && now < blockedUntil) {
    return true;
  }
  const lastAttempt = readTimestamp(LOGIN_ATTEMPT_KEY);
  if (lastAttempt && now - lastAttempt < LOGIN_LOOP_WINDOW_MS) {
    writeTimestamp(LOGIN_BLOCKED_KEY, now + LOGIN_LOOP_BACKOFF_MS);
    return true;
  }
  return false;
}

/** Forgets past attempts: a token was obtained, or the user acted themselves. */
function clearLoginAttempts(): void {
  try {
    window.sessionStorage.removeItem(LOGIN_ATTEMPT_KEY);
    window.sessionStorage.removeItem(LOGIN_BLOCKED_KEY);
  } catch {
    // See readTimestamp.
  }
}

/**
 * The login redirect in flight for each Auth0 client. loginWithRedirect only
 * starts a navigation; until the page unloads, other callers keep running, and
 * each extra loginWithRedirect overwrites the stored transaction. The callback
 * then fails its state check ("Invalid state") and the code is never exchanged.
 * Keyed by client rather than AuthManager because setOrganization and
 * clearOrganization create new managers around the same client.
 */
let loginRedirects = new WeakMap<Auth0Client, Promise<void>>();

// Pressing Back from the Auth0 page can restore this page from the bfcache with
// the redirect still recorded as in flight, which would make login a no-op.
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      loginRedirects = new WeakMap();
    }
  });
}

/**
 * Configuration options for AuthManager
 * @param authentication An instaniated Auth0 Client
 * @param organization An id of an organization to login as
 * @param audience The top-level domain of the Photon API
 */
export interface AuthManagerOptions {
  authentication: Auth0Client;
  organization?: string;
  audience?: string;
  connection?: string;
}

/**
 * Configuration options for login
 * @param organizationId An id of an organization to login as
 * @param invitation An Auth0 invitation string
 * @param appState State to pass Auth0, which will be restored on redirect. Useful for redirecting back to the same page after login
 */
export interface LoginOptions {
  organizationId?: string;
  connection?: string;
  appState?: object;
}

/**
 * Configuration options for logout
 * @param returnTo Where to redirect after logging out
 */
export interface LogoutOptions {
  returnTo?: string;
  federated?: boolean;
}

/**
 * Configuration options for getAccessToken
 * @param audience Audience to specify on the retrieved access token
 */
export interface GetAccessTokenOptions {
  audience?: string;
}

/**
 * Contains various methods for authentication (Auth0)
 */
export class AuthManager {
  private authentication: Auth0Client;

  private organization?: string;

  private audience?: string;

  private connection?: string;

  /**
   * @param config - Photon AuthManager configuration options
   * @remarks - Note, that organization is optional for scenarios in which a provider supports more than themselves.
   */
  constructor({
    authentication,
    organization,
    audience = 'https://api.photon.health',
    connection
  }: AuthManagerOptions) {
    this.authentication = authentication;
    this.organization = organization;
    this.audience = audience;
    this.connection = connection;
  }

  /**
   * Performs a login against the specified Auth0 domain
   * @param config - Login configuration
   * @returns
   */
  public async login({ organizationId, connection, appState }: LoginOptions): Promise<void> {
    const opts: RedirectLoginOptions<any> = {
      authorizationParams: {
        ...(this.audience ? { audience: this.audience } : {}),
        ...(connection || this.connection ? { connection: connection || this.connection } : {}),
        ...(organizationId || this.organization
          ? { organization: organizationId || this.organization }
          : {})
      },
      ...(appState ? { appState } : {})
    };

    // An explicit login (a button, autoLogin) is never blocked by the loop
    // breaker, but it still shares the in-flight redirect.
    return this.redirectToLogin(opts, { breakLoops: false });
  }

  /**
   * Starts at most one login redirect per page load and Auth0 client; later
   * callers get the redirect already under way.
   *
   * With `breakLoops`, refuses to redirect (throws LoginLoopError) when the
   * last redirect was moments ago and nothing since has produced a token.
   */
  private redirectToLogin(
    opts: RedirectLoginOptions,
    { breakLoops }: { breakLoops: boolean }
  ): Promise<void> {
    const inFlight = loginRedirects.get(this.authentication);
    if (inFlight) {
      return inFlight;
    }

    if (breakLoops) {
      if (isLoginLoop()) {
        return Promise.reject(new LoginLoopError());
      }
    } else {
      // The user asked to log in, so a loop detected earlier no longer applies.
      clearLoginAttempts();
    }

    writeTimestamp(LOGIN_ATTEMPT_KEY, Date.now());
    const redirect = this.authentication.loginWithRedirect(opts).catch((error) => {
      // Nothing is navigating, so the next login has to be free to try again.
      loginRedirects.delete(this.authentication);
      throw error;
    });
    loginRedirects.set(this.authentication, redirect);
    return redirect;
  }

  /**
   * Performs a logout against the specified Auth0 domain
   * @param config - Logout configuration
   * @returns
   */
  public async logout({ returnTo, federated = false }: LogoutOptions): Promise<void> {
    const opts: Auth0LogoutOptions = {
      logoutParams: {
        ...(returnTo ? { returnTo } : {}),
        ...(federated ? { federated } : {})
      }
    };

    clearLoginAttempts();
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

  private _getAccessToken = async (
    { audience }: { audience?: string } = {
      audience: this.audience
    }
  ): Promise<string> => {
    const opts: GetTokenSilentlyOptions | GetTokenWithPopupOptions = {
      authorizationParams: {
        audience: audience || this.audience || undefined,
        ...(this.organization ? { organization: this.organization } : {})
      }
    };

    let token;
    try {
      token = await this.authentication.getTokenSilently(opts);
    } catch (e) {
      if ((e as Error).message.includes('Consent required')) {
        token = await this.authentication.getTokenWithPopup(opts);
      }
    }
    if (!token) {
      const redirectOpts: RedirectLoginOptions = {
        ...opts,
        appState: {
          returnTo: `${window.location.pathname}${window.location.search}`
        }
      };
      // Throws LoginLoopError instead when the last redirect just came back empty.
      await this.redirectToLogin(redirectOpts, { breakLoops: true });
      // The page is navigating away. Retrying here would only start another
      // silent auth and another redirect, racing the one under way.
      throw new Error('Unable to retrieve access token'); // Session likely expired
    }
    clearLoginAttempts();
    return token;
  };

  /**
   * Retrieves a valid access token
   * @param config - getAccessToken configuration
   * @returns
   */
  public async getAccessToken(
    { audience }: { audience?: string } = {
      audience: this.audience
    }
  ): Promise<string> {
    return await this._getAccessToken({ audience: audience ?? this.audience });
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
   * Handes Auth0 redirect after login
   * @param url - The url which contains the code and state parameters (defaults to window.location.href)
   * @returns
   */
  public async handleRedirect(url?: string) {
    try {
      // Must be awaited inside the try. Returning the promise un-awaited meant
      // a rejected exchange bypassed this catch entirely, so the failure was
      // never logged here and surfaced only as an opaque rejection upstream.
      const result = await this.authentication.handleRedirectCallback(url);
      clearLoginAttempts();
      return result;
    } catch (error) {
      console.error('[PhotonClient]: Failed to complete the Auth0 redirect.', error);
      throw error;
    }
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
