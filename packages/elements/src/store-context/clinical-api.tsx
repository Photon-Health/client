import { PhotonClient } from '@photonhealth/sdk';
import {
  Catalog,
  DispenseUnit,
  MutationCreatePrescriptionArgs,
  Patient,
  Prescription,
  PrescriptionTemplate,
  Treatment
} from '@photonhealth/sdk/dist/types';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { batch } from 'solid-js';
import { createStore } from 'solid-js/store';

export interface ClinicalApiWrapperStoreType {
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
    errors: GraphQLError[];
    error?: any;
    data?: Prescription;
  };
}

const [store, setStore] = createStore<ClinicalApiWrapperStoreType>({
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

export interface ClinicalApiWrapper {
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
      errors: GraphQLError[];
      error?: any;
    };
    createPrescription: (args: MutationCreatePrescriptionArgs) => Promise<{
      data: { createPrescription: Prescription } | null | undefined;
      errors: readonly GraphQLError[] | undefined;
    }>;
  };
}

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

export const makeClinical = (sdk: PhotonClient): ClinicalApiWrapper => {
  const getPatients = async (args?: {
    after?: string;
    first?: number;
    name?: string;
    clear?: boolean;
  }) => {
    if (!args) {
      args = {};
    }
    setStore('patients', 'isLoading', true);
    const { data } = await sdk.clinical.patient.getPatients(args);
    setStore('patients', {
      isLoading: false,
      patients: args.clear ? data.patients : store.patients.patients.concat(data.patients),
      finished: data.patients.length == 0
    });
  };

  const getPatient = async (args: { id: string }) => {
    setStore('patient', 'isLoading', true);
    const { data } = await sdk.clinical.patient.getPatient(args);
    setStore('patient', {
      isLoading: false,
      patient: data.patient
    });
    return data.patient;
  };

  const getCatalog = async (args: { id: string }) => {
    setStore('catalog', 'isLoading', true);
    const { data } = await sdk.clinical.catalog.getCatalog({
      id: args.id,
      fragment: CatalogTreatmentFieldsMap
    });
    setStore('catalog', {
      isLoading: false,
      treatments: data.catalog.treatments.filter((x): x is Treatment => x != null),
      templates: data.catalog.templates.filter((x): x is PrescriptionTemplate => x != null)
    });
  };

  const getCatalogs = async () => {
    setStore('catalogs', 'isLoading', true);
    const { data } = await sdk.clinical.catalog.getCatalogs();
    setStore('catalogs', {
      isLoading: false,
      catalogs: data.catalogs
    });
  };

  const getDispenseUnits = async () => {
    setStore('dispenseUnits', 'isLoading', true);
    const { data } = await sdk.clinical.prescription.getDispenseUnits();
    setStore('dispenseUnits', {
      isLoading: false,
      dispenseUnits: data.dispenseUnits.map((x, idx) => ({
        id: String(idx),
        ...x
      }))
    });
  };

  const createPrescription = async (args: MutationCreatePrescriptionArgs) => {
    setStore('prescription', 'isLoading', true);
    const createPrescriptionMutation = sdk.clinical.prescription.createPrescription({});
    try {
      const { data, errors } = await createPrescriptionMutation({
        variables: args,
        refetchQueries: [],
        awaitRefetchQueries: false
      });
      batch(() => {
        if (errors && errors.length > 0) {
          setStore('prescription', 'errors', [...errors]);
        }
        if (data?.createPrescription) {
          setStore('prescription', 'data', data.createPrescription);
        }
        setStore('prescription', 'isLoading', false);
      });
      return {
        data,
        errors
      };
    } catch (e) {
      setStore('prescription', (p) => ({
        ...p,
        error: e,
        isLoading: false
      }));
      return {
        data: null,
        errors: []
      };
    }
  };

  const clinical = {
    catalog: {
      state: store.catalog,
      getCatalog: getCatalog
    },
    catalogs: {
      state: store.catalogs,
      getCatalogs: getCatalogs
    },
    dispenseUnits: {
      state: store.dispenseUnits,
      getDispenseUnits: getDispenseUnits
    },
    patients: {
      state: store.patients,
      getPatients: getPatients
    },
    patient: {
      state: store.patient,
      getPatient: getPatient
    },
    prescription: {
      state: store.prescription,
      createPrescription: createPrescription
    }
  };
  return clinical;
};
