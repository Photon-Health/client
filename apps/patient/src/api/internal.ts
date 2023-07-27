import { types } from 'packages/sdk/dist/lib';

import { graphQLClient } from '../configs/graphqlClient';
import { GET_PHARMACIES, MARK_ORDER_AS_PICKED_UP } from '../utils/graphql';

export const AUTH_HEADER_ERRORS = ['EMPTY_AUTHORIZATION_HEADER', 'INVALID_AUTHORIZATION_HEADER'];

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
    const query: { pharmaciesByLocation: types.Pharmacy[] } = await graphQLClient.request(
      GET_PHARMACIES,
      {
        location: searchParams,
        limit,
        offset
      }
    );
    if (query?.pharmaciesByLocation?.length > 0) {
      return query.pharmaciesByLocation;
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

export const markOrderAsPickedUp = async (orderId: string, token: string) => {
  graphQLClient.setHeader('x-photon-auth', token);

  try {
    const query: { markOrderAsPickedUp: boolean } = await graphQLClient.request(
      MARK_ORDER_AS_PICKED_UP,
      { markOrderAsPickedUpId: orderId }
    );
    if (query?.markOrderAsPickedUp) {
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
