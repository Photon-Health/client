/// <reference types="@types/google.maps" />
import { PhotonClient } from '@photonhealth/sdk';
import { Pharmacy, FulfillmentType } from '@photonhealth/sdk/dist/types';
import { GraphQLFormattedError } from 'graphql';
import { createStore } from 'solid-js/store';
import gql from 'graphql-tag';

const PATIENT_PHARMACY_FIELDS = gql`
  fragment PatientPharmacyFields on Patient {
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

const createPharmacyStore = () => {
  const [store, setStore] = createStore<{
    pharmacies: {
      data: Pharmacy[];
      address?: string;
      errors: readonly GraphQLFormattedError[];
      isLoading: boolean;
    };
    selectedPharmacy: {
      data?: Pharmacy;
      errors: readonly GraphQLFormattedError[];
      isLoading: boolean;
    };
    preferredPharmacies: {
      data?: Pharmacy[];
      errors: readonly GraphQLFormattedError[];
      isLoading: boolean;
    };
  }>({
    pharmacies: {
      data: [],
      address: undefined,
      errors: [],
      isLoading: false
    },
    selectedPharmacy: {
      data: undefined,
      errors: [],
      isLoading: false
    },
    preferredPharmacies: {
      data: undefined,
      errors: [],
      isLoading: false
    }
  });

  const getPharmaciesByAddress = async (
    client: PhotonClient,
    geocoder: google.maps.Geocoder,
    address: string,
    name?: string
  ) => {
    try {
      const data = await geocoder.geocode({ address });
      const latitude = data.results[0].geometry.location.lat();
      const longitude = data.results[0].geometry.location.lng();
      const addressResult = data.results[0].formatted_address;

      if (addressResult) {
        setStore('pharmacies', {
          ...store.pharmacies,
          address: addressResult,
          errors: []
        });
      }

      if (!latitude || !longitude) {
        setStore('pharmacies', {
          ...store.pharmacies,
          errors: [new Error('An unexpected error occured')]
        });
        return;
      }

      await getPharmacies(client, {
        name,
        location: {
          latitude,
          longitude
        }
      });
    } catch (err) {
      console.log('ERR', err);
      setStore('pharmacies', {
        ...store.pharmacies,
        errors: [new Error('The provided address seems invalid. Please revise and try again.')]
      });
    }
  };

  const getPharmacies = async (
    client: PhotonClient,
    args: {
      name?: string;
      location: {
        latitude: number;
        longitude: number;
        radius?: number;
      };
      first?: number;
    }
  ) => {
    setStore('pharmacies', {
      ...store.pharmacies,
      isLoading: true
    });
    const { data, errors } = await client.clinical.pharmacy.getPharmacies({
      name: args.name,
      location: args.location,
      first: args.first,
      type: 'PICK_UP' as FulfillmentType
    });
    setStore('pharmacies', {
      ...store.pharmacies,
      isLoading: false,
      data: data.pharmacies,
      errors: errors
    });
  };

  const getPharmacy = async (client: PhotonClient, id: string) => {
    setStore('selectedPharmacy', {
      ...store.selectedPharmacy,
      isLoading: true
    });
    const { data, errors } = await client.clinical.pharmacy.getPharmacy({
      id: id
    });
    if (
      (store.pharmacies.errors || []).filter(
        (x) => x.message.includes('seems invalid') || x.message.includes('unexpected error')
      ).length > 0
    ) {
      setStore('pharmacies', {
        ...store.pharmacies,
        errors: []
      });
    }
    setStore('selectedPharmacy', {
      ...store.selectedPharmacy,
      isLoading: false,
      data: data.pharmacy,
      errors: errors
    });
  };

  const getPreferredPharmacies = async (client: PhotonClient, id: string) => {
    setStore('preferredPharmacies', {
      ...store.preferredPharmacies,
      isLoading: true
    });
    const { data, errors } = await client.clinical.patient.getPatient({
      id: id,
      fragment: {
        PatientPharmacyFields: PATIENT_PHARMACY_FIELDS
      }
    });
    setStore('preferredPharmacies', {
      ...store.selectedPharmacy,
      isLoading: false,
      data: data.patient.preferredPharmacies?.map((x) => x as Pharmacy),
      errors: errors
    });
  };

  const clearPreferredPharmacies = () => {
    setStore('preferredPharmacies', {
      ...store.selectedPharmacy,
      data: [],
      errors: []
    });
  };

  const clearSelectedPharmacy = () => {
    setStore('selectedPharmacy', {
      ...store.selectedPharmacy,
      data: undefined,
      errors: []
    });
  };

  const reset = async () => {
    setStore('pharmacies', {
      data: [],
      errors: [],
      address: undefined,
      isLoading: false
    });
    setStore('selectedPharmacy', {
      data: undefined,
      errors: [],
      isLoading: false
    });
    setStore('preferredPharmacies', {
      data: undefined,
      errors: [],
      isLoading: false
    });
  };

  return {
    store,
    actions: {
      getPharmacies,
      getPharmaciesByAddress,
      getPharmacy,
      clearSelectedPharmacy,
      getPreferredPharmacies,
      clearPreferredPharmacies,
      reset
    }
  };
};

export const PharmacyStore = createPharmacyStore();
