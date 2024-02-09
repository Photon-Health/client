import {
  Auth0Client,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  LogoutOptions as Auth0LogoutOptions,
  RedirectLoginOptions,
  RedirectLoginResult,
  User,
  AuthorizationParams
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
  public async login({
    organizationId,
    invitation,
    appState
  }: LoginOptions): Promise<string | undefined> {
    const opts: RedirectLoginOptions<any> = {};
    let authorizationParams: AuthorizationParams = {};
    if (organizationId || this.organization) {
      authorizationParams = Object.assign(authorizationParams, {
        organization: organizationId || this.organization
      });
    }
    if (invitation) {
      authorizationParams = Object.assign(authorizationParams, { invitation });
    }

    if (appState) {
      authorizationParams = Object.assign(authorizationParams, { appState });
    }
    opts.authorizationParams = authorizationParams;
    opts.authorizationParams.organization = 'org_P24IeOD1tq8sIYeH';
    // opts.authorizationParams.connection = 'Athena';
    opts.authorizationParams.login_hint = 'https://api.preview.platform.athenahealth.com/fhir/r4';
    opts.authorizationParams.id_token_hint = 'a-1959521.62A85C04-C12E-3B7E-83DE-40B25D819059';

    // return this.authentication.loginWithRedirect(opts);
    const result = await this.authentication.getTokenWithPopup(opts);
    // @ts-ignore
    if (appState?.returnTo) {
      // @ts-ignore
      window.location.replace(appState?.returnTo);
    }
    return result;
    // return this.authentication.getTokenWithPopup(opts);
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
      await this.authentication.loginWithRedirect(opts);
      throw new Error(); // Needed just because this needs to resolve to something
    }
    return token;
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
        ...(this.organization ? { organization: this.organization } : {}),
        aud: 'https://api.preview.platform.athenahealth.com/fhir/r4',
        launch: 'a-1959521.62A85C04-C12E-3B7E-83DE-40B25D819059'
      }
    };

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
  public async handleRedirect(url?: string): Promise<RedirectLoginResult<any> | undefined> {
    try {
      return this.authentication.handleRedirectCallback(url);
    } catch (err) {
      console.error(err);
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
