import { PhotonClient } from '@photonhealth/sdk';
import { Patient } from '@photonhealth/sdk/dist/types';
import { GraphQLFormattedError } from 'graphql';
import { createStore } from 'solid-js/store';
import gql from 'graphql-tag';

const PATIENT_ORDER_FIELDS = gql`
  fragment PatientOrderFields on Patient {
    id
    externalId
    name {
      full
      first
      middle
      last
      title
    }
    dateOfBirth
    sex
    gender
    email
    phone
    address {
      name {
        full
      }
      city
      country
      postalCode
      state
      street1
      street2
    }
    preferredPharmacies {
      id
      name
      address {
        city
        country
        postalCode
        state
        street1
        street2
      }
      phone
    }
  }
`;

const createPatientStore = () => {
  const [store, setStore] = createStore<{
    patients: {
      data: Patient[];
      errors: readonly GraphQLFormattedError[];
      isLoading: boolean;
      finished: boolean;
    };
    selectedPatient: {
      data?: Patient;
      errors: readonly GraphQLFormattedError[];
      isLoading: boolean;
    };
  }>({
    patients: {
      data: [],
      errors: [],
      isLoading: false,
      finished: false
    },
    selectedPatient: {
      data: undefined,
      errors: [],
      isLoading: false
    }
  });

  const getSelectedPatient = async (client: PhotonClient, id: string) => {
    setStore('selectedPatient', {
      ...store.selectedPatient,
      isLoading: true
    });
    const { data, errors } = await client.clinical.patient.getPatient({
      id,
      fragment: {
        PatientOrderFields: PATIENT_ORDER_FIELDS
      }
    });
    setStore('selectedPatient', {
      ...store.selectedPatient,
      isLoading: false,
      data: data.patient,
      errors: errors
    });
  };

  const getPatients = async (
    client: PhotonClient,
    args?: {
      first?: number;
      name?: string;
    }
  ) => {
    if (!args) {
      args = {};
    }
    setStore('patients', {
      ...store.patients,
      isLoading: true
    });
    const { data, errors } = await client.clinical.patient.getPatients({
      first: args.first,
      name: args.name,
      fragment: {
        PatientOrderFields: PATIENT_ORDER_FIELDS
      }
    });
    setStore('patients', {
      ...store.patients,
      isLoading: false,
      errors: errors,
      data: data.patients,
      finished: data.patients.length === 0
    });
    return (!errors || errors.length === 0) && data.patients.length > 0
      ? () =>
          fetchMorePatients(client, {
            ...args,
            after: data.patients?.at(-1)!.id
          })
      : undefined;
  };

  const fetchMorePatients = async (
    client: PhotonClient,
    args?: {
      after: string;
      first?: number;
      name?: string;
    }
  ) => {
    setStore('patients', {
      ...store.patients,
      isLoading: true
    });
    const { data, errors } = await client.clinical.patient.getPatients(args);
    setStore('patients', {
      ...store.patients,
      isLoading: false,
      errors: errors,
      data: [...store.patients.data, ...data.patients],
      finished: data.patients.length === 0
    });
    return (!errors || errors.length === 0) && data.patients.length > 0
      ? () =>
          fetchMorePatients(client, {
            ...args,
            after: data.patients?.at(-1)!.id
          })
      : undefined;
  };

  const clearSelectedPatient = async () => {
    setStore('selectedPatient', {
      ...store.selectedPatient,
      data: undefined
    });
  };

  const reset = async () => {
    setStore('patients', {
      data: [],
      errors: [],
      isLoading: false,
      finished: false
    });
    setStore('selectedPatient', {
      data: undefined,
      errors: [],
      isLoading: false
    });
  };

  return {
    store,
    actions: {
      getPatients,
      getSelectedPatient,
      clearSelectedPatient,
      reset
    }
  };
};

export const PatientStore = createPatientStore();
