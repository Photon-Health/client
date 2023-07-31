import { types } from 'packages/sdk/dist/lib';

import { graphQLClient } from '../configs/graphqlClient';
import {
  GET_PHARMACIES,
  MARK_ORDER_AS_PICKED_UP,
  REROUTE_ORDER,
  SELECT_ORDER_PHARMACY,
  SET_PREFERRED_PHARMACY
} from '../utils/graphql';

export const AUTH_HEADER_ERRORS = ['EMPTY_AUTHORIZATION_HEADER', 'INVALID_AUTHORIZATION_HEADER'];

/**
 * Queries
 */

export const getPharmacies = async (
  searchParams: {
    latitude: number;
    longitude: number;
    radius: number;
  },
  limit: number,
  offset: number,
  token: string
) => {
  graphQLClient.setHeader('x-photon-auth', token);

  try {
    const response: { pharmaciesByLocation: types.Pharmacy[] } = await graphQLClient.request(
      GET_PHARMACIES,
      {
        location: searchParams,
        limit,
        offset
      }
    );
    if (response?.pharmaciesByLocation?.length > 0) {
      return response.pharmaciesByLocation;
    } else {
      throw new Error('No pharmacies found near location');
    }
  } catch (error) {
    if (error?.response?.errors?.[0].message === 'No pharmacies found near location') {
      const { message } = error.response.errors[0];
      throw new Error(message);
    } else {
      throw error;
    }
  }
};

/**
 * Mutations
 */

export const markOrderAsPickedUp = async (orderId: string, token: string) => {
  graphQLClient.setHeader('x-photon-auth', token);

  try {
    const response: { markOrderAsPickedUp: boolean } = await graphQLClient.request(
      MARK_ORDER_AS_PICKED_UP,
      { markOrderAsPickedUpId: orderId }
    );
    if (response?.markOrderAsPickedUp) {
      return true;
    } else {
      throw new Error('Unable to mark order as picked up');
    }
  } catch (error) {
    if (error?.response?.errors) {
      const { message } = error.response.errors[0];
      throw new Error(message);
    }
  }
};

export const rerouteOrder = async (orderId, pharmacyId, token: string) => {
  graphQLClient.setHeader('x-photon-auth', token);

  try {
    const response: { rerouteOrder: boolean } = await graphQLClient.request(REROUTE_ORDER, {
      orderId,
      pharmacyId
    });
    if (response?.rerouteOrder) {
      return true;
    } else {
      throw new Error('Unable to reroute order');
    }
  } catch (error) {
    if (error?.response?.errors) {
      const { message } = error.response.errors[0];
      throw new Error(message);
    }
  }
};

export const selectOrderPharmacy = async (
  orderId: string,
  pharmacyId: string,
  patientId: string,
  token: string
) => {
  graphQLClient.setHeader('x-photon-auth', token);

  try {
    const response: { selectOrderPharmacy: boolean } = await graphQLClient.request(
      SELECT_ORDER_PHARMACY,
      {
        orderId,
        pharmacyId,
        patientId
      }
    );

    if (response?.selectOrderPharmacy) {
      return true;
    } else {
      throw new Error('Unable to select pharmacy');
    }
  } catch (error) {
    if (error?.response?.errors) {
      throw new Error(error.response.errors[0].message);
    }
  }
};

export const setPreferredPharmacy = async (
  patientId: string,
  pharmacyId: string,
  token: string
) => {
  graphQLClient.setHeader('x-photon-auth', token);

  try {
    const response: { setPreferredPharmacy: boolean } = await graphQLClient.request(
      SET_PREFERRED_PHARMACY,
      {
        patientId,
        pharmacyId
      }
    );

    if (response?.setPreferredPharmacy) {
      return true;
    } else {
      throw new Error('Unable to set preferred pharmacy');
    }
  } catch (error) {
    if (error?.response?.errors) {
      throw new Error(error.response.errors[0].message);
    }
  }
};
