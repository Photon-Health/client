import { User } from '@auth0/auth0-react';
import { PhotonClient } from '@photonhealth/sdk';
import { LoginOptions } from '@photonhealth/sdk/dist/auth';
import { Permission } from '@photonhealth/sdk/dist/types';
import jwtDecode from 'jwt-decode';
import { batch } from 'solid-js';
import { createStore } from 'solid-js/store';

const defaultOnRedirectCallback = (appState: { returnTo?: string }): void => {
  window.location.replace(appState?.returnTo || window.location.pathname);
};

export interface AuthenticationWrapper {
  state: {
    user: (User & { org_id?: string }) | undefined;
    isAuthenticated: boolean;
    isInOrg: boolean;
    permissions: Permission[];
    error?: string;
    isLoading: boolean;
  };
  handleRedirect: (url?: string) => Promise<void>;
  checkSession: () => Promise<void>;
  login: (args?: LoginOptions) => Promise<void>;
  logout: () => void;
}

interface AuthenticationStoreType {
  isAuthenticated: boolean;
  isInOrg: boolean;
  isLoading: boolean;
  permissions: Permission[];
  error?: string;
  user: (User & { org_id?: string }) | undefined;
}

const [store, setStore] = createStore<AuthenticationStoreType & { _loadingCount: number }>({
  _loadingCount: 0,
  isAuthenticated: false,
  isInOrg: false,
  permissions: [],
  error: undefined,
  user: undefined,
  get isLoading() {
    return this._loadingCount > 0;
  }
});

export const makeAuthentication = (sdk: PhotonClient) => {
  setStore('_loadingCount', (s) => s + 1);
  const handleRedirect = async (url?: string) => {
    try {
      const result = await sdk.authentication.handleRedirect(url);
      defaultOnRedirectCallback(result?.appState);
    } catch (err) {
      const urlParams = new URLSearchParams(window.location.search);
      const errorMessage = urlParams.get('error_description');
      if ((err as Error).message.includes('must be an organization id')) {
        setStore({
          error: 'The provided organization id is invalid or does not exist',
          _loadingCount: 0
        });
      } else if (errorMessage?.includes('is not part of the org')) {
        setStore({ error: 'User is not authorized', _loadingCount: 0 });
      } else {
        setStore({ error: (err as Error).message, _loadingCount: 0 });
      }
    }
  };

  const checkSession = async () => {
    batch(async () => {
      try {
        setStore('_loadingCount', (s) => s + 1);
        await sdk.authentication.checkSession();
        const authenticated = await sdk.authentication.isAuthenticated();
        const user = await sdk.authentication.getUser();

        let permissions: Permission[];
        try {
          const token = await sdk.authentication.getAccessToken();

          const decoded: { permissions: Permission[] } = jwtDecode(token);
          permissions = decoded?.permissions || [];
        } catch (err) {
          permissions = [];
        }

        const isInOrg = authenticated && user?.org_id && user.org_id === sdk.organization;

        setStore({
          isAuthenticated: authenticated,
          user,
          isInOrg,
          permissions,
          _loadingCount: 0
        });
      } catch (err) {
        setStore('_loadingCount', (s) => s - 1);
      }
      console.log(new Error().stack);
    });
  };

  const login = async (args = {}) => {
    setStore('_loadingCount', (s) => s + 1);
    console.log(new Error().stack);
    const loginArgs = { organizationId: sdk.organization, ...args };
    await sdk.authentication.login(loginArgs);
    await checkSession();
    setStore('_loadingCount', (s) => s - 1);
  };

  const logout = async (args = {}) => {
    setStore('_loadingCount', (s) => s + 1);
    await sdk.authentication.logout(args);
    setStore({
      isAuthenticated: false,
      isInOrg: false,
      permissions: [],
      user: undefined
    });
    setStore('_loadingCount', (s) => s - 1);
  };

  const initialize = async () => {
    if (await sdk.authentication.isAuthenticated()) {
      setStore('isAuthenticated', true);
      checkSession();
    } else {
      setStore('isAuthenticated', false);
    }
  };

  initialize().then(() => setStore('_loadingCount', (s) => s - 1));

  return {
    state: store as Omit<typeof store, '_loadingCount'>,
    handleRedirect,
    login,
    logout,
    checkSession
  };
};
