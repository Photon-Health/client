import { createStore } from 'solid-js/store';
import { PhotonClient } from '@photonhealth/sdk';
import {
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
import { GraphQLFormattedError } from 'graphql';
import jwtDecode from 'jwt-decode';

const defaultOnRedirectCallback = (appState?: any): void => {
  if (appState?.returnTo) {
    window.location.replace(appState?.returnTo);
  } else {
    window.history.pushState(null, window.document.title, window.location.pathname);
  }
};

const CATALOG_TREATMENTS_FIELDS = gql`
  fragment CatalogTreatmentsFieldsElementsFragment on Catalog {
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
  CatalogTreatmentsFieldsElementsFragment: CATALOG_TREATMENTS_FIELDS
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
    handleRedirect: (url?: string) => Promise<void>;
    checkSession: () => Promise<void>;
    login: (args?: object) => Promise<void>;
    logout: () => void;
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
      handleRedirect: async (url?: string) => {
        try {
          const result = await this.sdk.authentication.handleRedirect(url);
          defaultOnRedirectCallback(result?.appState);
          await this.authentication.checkSession();
        } catch (err: any) {
          const urlParams = new URLSearchParams(window.location.search);
          const errorMessage = urlParams.get('error_description');
          if (err.message.includes('must be an organization id')) {
            this.setStore('authentication', {
              ...this.store.authentication,
              error: 'The provided organization id is invalid or does not exist'
            });
          } else if (errorMessage?.includes('is not part of the org')) {
            this.setStore('authentication', {
              ...this.store.authentication,
              error: 'User is not authorized',
              isLoading: false
            });
          } else {
            this.setStore('authentication', {
              ...this.store.authentication,
              error: err.message
            });
          }
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
    try {
      await this.sdk.authentication.checkSession();
      const authenticated = await this.sdk.authentication.isAuthenticated();
      this.setStore('authentication', {
        ...this.store.authentication,
        isAuthenticated: authenticated
      });
      const user = await this.sdk.authentication.getUser();
      const hasOrgs = !!this.sdk?.organization && !!user?.org_id;

      let permissions: Permission[] = [];

      if (this.autoLogin || authenticated) {
        // getAccessToken is triggering the SSO screen to appear, so for auto-login=false, we don't want to call it
        try {
          const token = await this.sdk.authentication.getAccessToken();

          const decoded: { permissions: Permission[] } = jwtDecode(token);
          permissions = decoded?.permissions || [];
        } catch (err) {
          permissions = [];
        }
      }

      this.setStore('authentication', {
        ...this.store.authentication,
        user: user,
        isLoading: false,
        isInOrg: authenticated && hasOrgs && this.sdk.organization === user.org_id,
        permissions: permissions || []
      });
    } catch (err) {
      this.setStore('authentication', {
        ...this.store.authentication,
        isLoading: false
      });
    }
  }
  private async login(args = {}) {
    await this.sdk.authentication.login(args);
    await this.checkSession();
  }
  private async logout(args = {}) {
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
