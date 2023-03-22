import {
  Auth0Client,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  LogoutOptions as Auth0LogoutOptions,
  RedirectLoginOptions,
  RedirectLoginResult,
  User
} from '@auth0/auth0-spa-js';

const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

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

  /**
   * @param config - Photon AuthManager configuration options
   * @remarks - Note, that organization is optional for scenarios in which a provider supports more than themselves.
   */
  constructor({
    authentication,
    organization,
    audience = 'https://api.photon.health'
  }: AuthManagerOptions) {
    this.authentication = authentication;
    this.organization = organization;
    this.audience = audience;
  }

  /**
   * Performs a login against the specified Auth0 domain
   * @param config - Login configuration
   * @returns
   */
  public async login({ organizationId, invitation, appState }: LoginOptions): Promise<void> {
    let opts: RedirectLoginOptions<any> = { redirectMethod: 'assign' };

    if (organizationId || this.organization) {
      opts = Object.assign(opts, {
        organization: organizationId || this.organization
      });
    }
    if (invitation) {
      opts = Object.assign(opts, { invitation });
    }

    if (appState) {
      opts = Object.assign(opts, { appState });
    }

    return this.authentication.loginWithRedirect(opts);
  }

  /**
   * Performs a logout against the specified Auth0 domain
   * @param config - Logout configuration
   * @returns
   */
  public async logout({ returnTo, federated = false }: LogoutOptions): Promise<void> {
    const opts: Auth0LogoutOptions = {
      ...(returnTo ? { returnTo } : {}),
      ...(federated ? { federated } : {})
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
    let opts: GetTokenSilentlyOptions = { audience: audience || this.audience || undefined };
    if (this.organization) {
      opts = Object.assign(opts, {
        organization: this.organization
      });
    }
    return this.authentication.getTokenSilently(opts);
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
  ): Promise<string> {
    let opts: GetTokenWithPopupOptions = { audience: audience || this.audience || undefined };

    if (this.organization) {
      opts = Object.assign(opts, {
        organization: this.organization
      });
    }
    return this.authentication.getTokenWithPopup(opts);
  }

  /**
   * Silently performs a getAccessToken and pre-populates the token and user information caches
   * @returns
   */
  public async checkSession(): Promise<void> {
    return this.authentication.checkSession();
  }

  /**
   * Handes Auth0 redirect after login
   * @param url - The url which contains the code and state parameters (defaults to window.location.href)
   * @returns
   */
  public async handleRedirect(url?: string): Promise<RedirectLoginResult<any>> {
    try {
      return this.authentication.handleRedirectCallback(url);
    } catch (err) {
      throw err;
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
    } catch (error) {
      return false;
    }
  }
}
