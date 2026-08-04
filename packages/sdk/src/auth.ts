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
  invitation?: string;
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
  public async login({
    organizationId,
    invitation,
    connection,
    appState
  }: LoginOptions): Promise<void> {
    const opts: RedirectLoginOptions<any> = {
      authorizationParams: {
        ...(this.audience ? { audience: this.audience } : {}),
        ...(connection || this.connection ? { connection: connection || this.connection } : {}),
        ...(organizationId || this.organization
          ? { organization: organizationId || this.organization }
          : {}),
        ...(invitation ? { invitation } : {})
      },
      ...(appState ? { appState } : {})
    };

    return this.authentication.loginWithRedirect(opts);
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
    },
    throwIfFailure = false
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
      await this.authentication.loginWithRedirect(redirectOpts);
      if (throwIfFailure) {
        throw new Error('Unable to retrieve access token'); // Session likely expired
      } else {
        // Retry once
        return await this._getAccessToken({ audience }, true);
      }
    }
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
      return await this.authentication.handleRedirectCallback(url);
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
