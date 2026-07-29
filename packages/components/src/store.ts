import { createStore } from 'solid-js/store';
import {
  clearOrgLoginAttempt,
  hasOrgLoginBeenAttempted,
  isLoginLoopError,
  LOGIN_LOOP_USER_MESSAGE,
  markOrgLoginAttempted,
  PhotonClient,
  stripAuthParams
} from '@photonhealth/sdk';
import type { LoginOptions, LogoutOptions } from '@photonhealth/sdk';
import type {
  Catalog,
  DispenseUnit,
  MutationCreatePrescriptionArgs,
  Patient,
  Permission,
  Prescription,
  PrescriptionTemplate,
  Treatment
} from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import jwtDecode from 'jwt-decode';
import type { GraphQLFormattedError } from 'graphql';

/**
 * Shown when we cannot tell whether a session exists — typically silent auth
 * being blocked in an embedded context, or an org/audience mismatch. Surfacing
 * this suppresses autoLogin, which would otherwise redirect, succeed, and fail
 * here again on arrival.
 */
export const SESSION_UNVERIFIABLE_MESSAGE =
  'Unable to verify your session. Please refresh the page, or contact support if this keeps happening.';

/** Shown when an org-scoped login keeps coming back without an `org_id` claim. */
export const ORG_LOGIN_FAILED_MESSAGE =
  'Unable to sign you in to your organization. Please contact support.';

/**
 * Drops the Auth0 redirect params from the address bar without navigating,
 * keeping the host app's own query string — some consumers rely on it
 * surviving a login round trip.
 *
 * replaceState rather than pushState: a URL holding a spent authorization code
 * must not be reachable by pressing Back either, or the failure comes straight
 * back.
 */
const clearAuthParamsFromUrl = (): void => {
  window.history.replaceState(
    null,
    window.document.title,
    `${window.location.pathname}${stripAuthParams(window.location.search)}`
  );
};

const defaultOnRedirectCallback = (appState?: any): void => {
  if (appState?.returnTo) {
    window.location.replace(appState?.returnTo);
  } else {
    clearAuthParamsFromUrl();
  }
};

const CATALOG_TREATMENTS_FIELDS = gql`
  fragment CatalogTreatmentsFieldsComponentFragment on Catalog {
    treatments {
      id
      name
    }
    templates {
      id
      daysSupply
      dispenseAsWritten
      dispenseQuantity
      dispenseUnit
      instructions
      notes
      fillsAllowed
      treatment {
        id
        name
      }
    }
  }
`;

const CatalogTreatmentFieldsMap = {
  CatalogTreatmentsFieldsComponentFragment: CATALOG_TREATMENTS_FIELDS
};

export class PhotonClientStore {
  public readonly sdk: PhotonClient;
  private setStore;
  private store;
  public authentication: {
    state: {
      user: any;
      isAuthenticated: boolean;
      isInOrg: boolean;
      permissions: Permission[];
      error?: string;
      isLoading: boolean;
    };
    /** Resolves to whether the authorization code exchange actually succeeded. */
    handleRedirect: (url?: string) => Promise<boolean>;
    checkSession: () => Promise<void>;
    login: (args?: LoginOptions) => Promise<void>;
    logout: (args?: LogoutOptions) => Promise<void>;
  };
  public getSDK: () => PhotonClient;
  public clinical: {
    catalog: {
      state: {
        isLoading: boolean;
        treatments: Treatment[];
        templates: PrescriptionTemplate[];
      };
      getCatalog: (args: { id: string }) => void;
    };
    catalogs: {
      state: {
        isLoading: boolean;
        catalogs: Catalog[];
      };
      getCatalogs: () => void;
    };
    dispenseUnits: {
      state: {
        isLoading: boolean;
        dispenseUnits: Array<DispenseUnit & { id: string }>;
      };
      getDispenseUnits: () => void;
    };
    patients: {
      state: {
        isLoading: boolean;
        patients: Patient[];
        finished: boolean;
      };
      getPatients: (args?: {
        after?: string;
        first?: number;
        name?: string;
        clear?: boolean;
      }) => void;
    };
    patient: {
      state: {
        isLoading: boolean;
        patient?: Patient;
      };
      getPatient: (args: { id: string }) => Promise<Patient>;
    };
    prescription: {
      state: {
        isLoading: boolean;
        data?: Prescription;
        errors: readonly GraphQLFormattedError[];
        error?: any;
      };
      createPrescription: (args: MutationCreatePrescriptionArgs) => Promise<{
        data: { createPrescription: Prescription } | null | undefined;
        errors: readonly GraphQLFormattedError[] | undefined;
      }>;
    };
  };

  public autoLogin: boolean;

  // appState recovered from the most recent Auth0 redirect, held so checkSession can
  // preserve the original returnTo if it triggers a second, org-scoped login.
  private redirectAppState?: { returnTo?: string };

  public constructor(sdk: PhotonClient, autoLogin = false) {
    this.sdk = sdk;
    this.autoLogin = autoLogin;

    const [store, setStore] = createStore<{
      authentication: {
        isAuthenticated: boolean;
        isInOrg: boolean;
        isLoading: boolean;
        permissions: Permission[];
        error?: string;
        user: any;
      };
      catalog: {
        isLoading: boolean;
        treatments: Treatment[];
        templates: PrescriptionTemplate[];
      };
      catalogs: {
        isLoading: boolean;
        catalogs: Catalog[];
      };
      dispenseUnits: {
        isLoading: boolean;
        dispenseUnits: Array<DispenseUnit & { id: string }>;
      };
      patients: {
        isLoading: boolean;
        patients: Patient[];
        finished: boolean;
      };
      patient: {
        isLoading: boolean;
        patient?: Patient;
      };
      prescription: {
        isLoading: boolean;
        errors: GraphQLFormattedError[];
        error?: any;
        data?: Prescription;
      };
    }>({
      authentication: {
        isAuthenticated: false,
        isInOrg: false,
        permissions: [],
        isLoading: true,
        error: undefined,
        user: undefined
      },
      catalog: {
        isLoading: false,
        treatments: [],
        templates: []
      },
      catalogs: {
        isLoading: false,
        catalogs: []
      },
      dispenseUnits: {
        isLoading: false,
        dispenseUnits: new Array<DispenseUnit & { id: string }>()
      },
      patients: {
        isLoading: false,
        patients: [],
        finished: false
      },
      patient: {
        isLoading: false,
        patient: undefined
      },
      prescription: {
        isLoading: false,
        errors: [],
        error: undefined,
        data: undefined
      }
    });
    this.setStore = setStore;
    this.store = store;
    this.authentication = {
      state: store.authentication,
      handleRedirect: async (url?: string): Promise<boolean> => {
        try {
          const result = await this.sdk.authentication.handleRedirect(url);
          defaultOnRedirectCallback(result?.appState);
          this.redirectAppState = result?.appState;
          try {
            await this.authentication.checkSession();
          } finally {
            this.redirectAppState = undefined;
          }
          return true;
        } catch (err: any) {
          const urlParams = new URLSearchParams(window.location.search);
          const errorMessage = urlParams.get('error_description');

          // Drop the redirect params whatever went wrong. Leaving them in place
          // keeps hasAuthParams() true, so every subsequent load re-enters this
          // same failing exchange rather than falling through to checkSession —
          // the app can never recover on its own, even when the session is
          // perfectly good.
          clearAuthParamsFromUrl();

          if (err?.message?.includes('must be an organization id')) {
            this.setStore('authentication', {
              ...this.store.authentication,
              error: 'The provided organization id is invalid or does not exist',
              isLoading: false
            });
          } else if (errorMessage?.includes('is not part of the org')) {
            this.setStore('authentication', {
              ...this.store.authentication,
              error: 'User is not authorized',
              isLoading: false
            });
          } else {
            // Usually a spent or replayed authorization code. The underlying
            // Auth0 session is often intact, so now the URL is clean, try to
            // pick it up instead of stranding the user on a dead page.
            this.setStore('authentication', {
              ...this.store.authentication,
              error: err?.message ?? 'Unable to complete sign in',
              isLoading: false
            });
            await this.checkSession();
          }
          return false;
        }
      },
      checkSession: this.checkSession.bind(this),
      login: this.login.bind(this),
      logout: this.logout.bind(this)
    };
    this.getSDK = this._getSDK.bind(this);
    this.clinical = {
      catalog: {
        state: store.catalog,
        getCatalog: this.getCatalog.bind(this)
      },
      catalogs: {
        state: store.catalogs,
        getCatalogs: this.getCatalogs.bind(this)
      },
      dispenseUnits: {
        state: store.dispenseUnits,
        getDispenseUnits: this.getDispenseUnits.bind(this)
      },
      patients: {
        state: store.patients,
        getPatients: this.getPatients.bind(this)
      },
      patient: {
        state: store.patient,
        getPatient: this.getPatient.bind(this)
      },
      prescription: {
        state: store.prescription,
        createPrescription: this.createPrescription.bind(this)
      }
    };
  }

  private _getSDK() {
    return this.sdk;
  }

  private async checkSession() {
    const clientId = this.sdk.clientId;
    try {
      const probe = await this.sdk.authentication.probeSession();

      if (probe.status === 'indeterminate') {
        // We could not establish whether a session exists — typically silent
        // auth being blocked, or an org/audience mismatch. Reporting this as
        // logged out would have autoLogin redirect to Auth0, which succeeds,
        // returns here, and fails identically: a loop of successful logins.
        console.error('[PhotonClient]: Unable to verify the Auth0 session.', probe.error);
        this.setStore('authentication', {
          ...this.store.authentication,
          isLoading: false,
          error: SESSION_UNVERIFIABLE_MESSAGE
        });
        return;
      }

      const authenticated = probe.status === 'authenticated';
      this.setStore('authentication', {
        ...this.store.authentication,
        isAuthenticated: authenticated
      });
      const user = await this.sdk.authentication.getUser();

      // @ts-ignore TODO: store will be updated soon, so this will change
      const isUserLoggedIntoAnOrganization = !!user?.org_id;
      const isOrganizationIdSelectedInPhotonClient = !!this.sdk?.organization;

      // If no org was configured upfront but the user was logged into one,
      // derive it from the authenticated user.
      if (!isOrganizationIdSelectedInPhotonClient && isUserLoggedIntoAnOrganization) {
        this.sdk.setOrganization(user.org_id);
      }

      let permissions: Permission[] = [];
      let error: string | undefined = undefined;

      if (this.autoLogin || authenticated) {
        // getAccessToken is triggering the SSO screen to appear, so for auto-login=false, we don't want to call it
        try {
          // Never redirect from here: checkSession also runs on a 60s poll, so
          // a redirect on failure would yank the user away mid-session.
          const token = await this.sdk.authentication.getAccessToken({
            redirectOnFailure: false
          });
          const decoded: {
            permissions: Permission[];
            'https://photon.health/assigned_org_id'?: string;
          } = jwtDecode(token);
          const assignedOrgId = decoded['https://photon.health/assigned_org_id'];
          if (
            !isOrganizationIdSelectedInPhotonClient &&
            !isUserLoggedIntoAnOrganization &&
            assignedOrgId
          ) {
            if (hasOrgLoginBeenAttempted(clientId, assignedOrgId)) {
              // We already redirected once for this org and came back still
              // without an org_id claim, so the org-scoped login isn't taking
              // effect. Asking again just loops — surface it instead.
              console.error(
                `[PhotonClient]: Logged in with assigned org ${assignedOrgId}, but the session ` +
                  'still carries no org_id claim. Verify the user is a member of that Auth0 ' +
                  'organization and that the application has Organizations enabled.'
              );
              error = ORG_LOGIN_FAILED_MESSAGE;
            } else {
              // No org was configured upfront and the user isn't logged into one, but the
              // token assigns them an org — re-login scoped to that org. The one-shot
              // marker above is what bounds this if the claim never materializes.
              markOrgLoginAttempted(clientId, assignedOrgId);
              this.sdk.setOrganization(assignedOrgId);
              await this.attemptLogin({
                appState: {
                  // Preserve the original login's returnTo (recovered by handleRedirect)
                  // so the destination survives the second, org-scoped login.
                  returnTo:
                    this.redirectAppState?.returnTo ??
                    `${window.location.pathname}${stripAuthParams(window.location.search)}`
                }
              });
              // Either navigating away, or attemptLogin surfaced the reason it
              // refused. Nothing useful left to compute either way.
              return;
            }
          }
          permissions = decoded?.permissions || [];
        } catch (_err) {
          permissions = [];
        }
      }

      // Read the org off the SDK here (rather than isOrganizationIdSelectedInPhotonClient,
      // captured above) so an org derived from user.org_id during this call counts too.
      // @ts-ignore TODO store will be updated soon, so this will change
      const selectedOrganizationId = this.sdk?.organization;
      const isInOrg =
        authenticated &&
        !!selectedOrganizationId &&
        isUserLoggedIntoAnOrganization &&
        selectedOrganizationId === user.org_id;

      // Reaching here authenticated and without error means we not only got a
      // session but could read it — the part that's already working when
      // looping is *getting* one, so only this counts as proof of progress.
      if (authenticated && !error) {
        this.sdk.authentication.confirmSessionEstablished();
        if (selectedOrganizationId) {
          clearOrgLoginAttempt(clientId, selectedOrganizationId);
        }
      }

      this.setStore('authentication', {
        ...this.store.authentication,
        user: user,
        isLoading: false,
        isInOrg: isInOrg,
        permissions: permissions || [],
        error
      });
    } catch (e) {
      // Unexpected failure (not a session verdict — probeSession reports those
      // without throwing). Surface it so autoLogin doesn't read the absent
      // session as "log in again".
      console.error('[PhotonClient]: Session check failed.', e);
      this.setStore('authentication', {
        ...this.store.authentication,
        isLoading: false,
        error: SESSION_UNVERIFIABLE_MESSAGE
      });
    }
  }

  /**
   * Initiates a login redirect, turning a tripped login-loop breaker into
   * surfaced error state instead of yet another redirect. Returns whether the
   * redirect actually started.
   */
  private async attemptLogin(args: LoginOptions = {}): Promise<boolean> {
    try {
      await this.sdk.authentication.login(args);
      return true;
    } catch (error) {
      if (isLoginLoopError(error)) {
        console.error(`[PhotonClient]: ${(error as Error).message}`);
        this.setStore('authentication', {
          ...this.store.authentication,
          isLoading: false,
          error: LOGIN_LOOP_USER_MESSAGE
        });
        return false;
      }
      console.error('[PhotonClient]: Login failed', error);
      this.setStore('authentication', {
        ...this.store.authentication,
        isLoading: false,
        error: (error as Error)?.message ?? 'Login failed'
      });
      return false;
    }
  }

  private async login(args: LoginOptions = {}) {
    const started = await this.attemptLogin(args);
    if (!started) return;
    await this.checkSession();
  }

  private async logout(args: LogoutOptions = {}) {
    await this.sdk.authentication.logout(args);
    this.setStore('authentication', {
      ...this.store.authentication,
      isAuthenticated: false,
      isInOrg: false,
      permissions: [],
      user: undefined
    });
  }

  private async getPatients(args?: {
    after?: string;
    first?: number;
    name?: string;
    clear?: boolean;
  }) {
    if (!args) {
      args = {};
    }
    this.setStore('patients', {
      ...this.store.patients,
      isLoading: true
    });
    const { data } = await this.sdk.clinical.patient.getPatients(args);
    this.setStore('patients', {
      ...this.store.patients,
      isLoading: false,
      patients: args.clear ? data.patients : this.store.patients.patients.concat(data.patients),
      finished: data.patients.length == 0
    });
  }

  private async getPatient(args: { id: string }) {
    this.setStore('patient', {
      ...this.store.patient,
      isLoading: true
    });
    const { data } = await this.sdk.clinical.patient.getPatient(args);
    this.setStore('patient', {
      ...this.store.patient,
      isLoading: false,
      patient: data.patient
    });
    return data.patient;
  }

  private async getCatalog(args: { id: string }) {
    this.setStore('catalog', {
      ...this.store.catalog,
      isLoading: true
    });
    const { data } = await this.sdk.clinical.catalog.getCatalog({
      id: args.id,
      fragment: CatalogTreatmentFieldsMap
    });
    this.setStore('catalog', {
      ...this.store.catalog,
      isLoading: false,
      treatments: data.catalog.treatments.map((x) => x!) || [],
      templates: data.catalog.templates.map((x) => x!) || []
    });
  }

  private async getCatalogs() {
    this.setStore('catalogs', {
      ...this.store.catalogs,
      isLoading: true
    });
    const { data } = await this.sdk.clinical.catalog.getCatalogs();
    this.setStore('catalogs', {
      ...this.store.catalogs,
      isLoading: false,
      catalogs: data.catalogs
    });
  }

  private async getDispenseUnits() {
    this.setStore('dispenseUnits', {
      ...this.store.dispenseUnits,
      isLoading: true
    });
    const { data } = await this.sdk.clinical.prescription.getDispenseUnits();
    this.setStore('dispenseUnits', {
      ...this.store.dispenseUnits,
      isLoading: false,
      dispenseUnits: data.dispenseUnits.map((x, idx) => ({
        id: String(idx),
        ...x
      }))
    });
  }

  private async createPrescription(args: MutationCreatePrescriptionArgs) {
    this.setStore('prescription', {
      ...this.store.prescription,
      isLoading: true
    });
    const createPrescriptionMutation = this.sdk.clinical.prescription.createPrescription({});
    try {
      const { data, errors } = await createPrescriptionMutation({
        variables: args,
        refetchQueries: [],
        awaitRefetchQueries: false
      });
      if (errors && errors.length > 0) {
        this.setStore('prescription', {
          ...this.store.prescription,
          errors: [...errors]
        });
      }
      if (data?.createPrescription) {
        this.setStore('prescription', {
          ...this.store.prescription,
          data: data.createPrescription
        });
      }
      this.setStore('prescription', {
        ...this.store.prescription,
        isLoading: false
      });
      return {
        data,
        errors
      };
    } catch (e) {
      this.setStore('prescription', {
        ...this.store.prescription,
        error: e,
        isLoading: false
      });
      return {
        data: null,
        errors: []
      };
    }
  }
}
