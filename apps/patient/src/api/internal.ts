import { types } from 'packages/sdk/dist/lib';

import { graphQLClient } from '../configs/graphqlClient';
import {
  GET_ORDER,
  GET_PHARMACIES,
  MARK_ORDER_AS_PICKED_UP,
  REROUTE_ORDER,
  SET_ORDER_PHARMACY,
  SET_PREFERRED_PHARMACY
} from '../graphql';
import { Order } from '../utils/models';

export const AUTH_HEADER_ERRORS = ['EMPTY_AUTHORIZATION_HEADER', 'INVALID_AUTHORIZATION_HEADER'];

/**
 * Queries
 */

export const getOrder = async (orderId: string) => {
  // Not wrapped in try/catch so error handling can be done in Main
  const response: { order: Order } = await graphQLClient.request(GET_ORDER, {
    id: orderId
  });
  if (response.order) {
    return response.order;
  } else {
    throw new Error('No order found');
  }
};

export const getPharmacies = async ({
  searchParams,
  limit,
  offset,
  isOpenNow,
  is24hr,
  name
}: {
  searchParams: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  limit: number;
  offset: number;
  isOpenNow: boolean;
  is24hr: boolean;
  name?: string;
}) => {
  try {
    const now = new Date();
    const response: { pharmaciesByLocation: types.Pharmacy[] } = await graphQLClient.request(
      GET_PHARMACIES,
      {
        location: searchParams,
        limit,
        offset,
        openAt: isOpenNow ? now : undefined,
        is24hr,
        name
      }
    );
    if (response?.pharmaciesByLocation?.length > 0) {
      return response.pharmaciesByLocation;
    } else {
      throw new Error('No pharmacies found near location');
    }
  } catch (error) {
    if (error?.response?.errors?.[0].message === 'No pharmacies found near location') {
      throw new Error(error.response.errors[0].message);
    } else {
      throw error;
    }
  }
};

/**
 * Mutations
 */

export const markOrderAsPickedUp = async (orderId: string) => {
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
    throw new Error(error.response.errors[0].message);
  }
};

export const rerouteOrder = async (orderId: string, pharmacyId: string, patientId: string) => {
  try {
    const response: { rerouteOrder: boolean } = await graphQLClient.request(REROUTE_ORDER, {
      orderId,
      pharmacyId,
      patientId
    });
    if (response?.rerouteOrder) {
      return true;
    } else {
      throw new Error('Unable to reroute order');
    }
  } catch (error) {
    throw new Error(error.response.errors[0].message);
  }
};

export const setOrderPharmacy = async (
  orderId: string,
  pharmacyId: string,
  readyBy: string,
  readyByDay: string,
  readyByTime: string
) => {
  try {
    const response: { setOrderPharmacy: boolean } = await graphQLClient.request(
      SET_ORDER_PHARMACY,
      {
        pharmacyId,
        orderId,
        readyBy,
        readyByDay,
        readyByTime
      }
    );

    if (response?.setOrderPharmacy) {
      return true;
    } else {
      throw new Error('Unable to set order pharmacy');
    }
  } catch (error) {
    throw new Error(error.response.errors[0].message);
  }
};

export const setPreferredPharmacy = async (patientId: string, pharmacyId: string) => {
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
    throw new Error(error.response.errors[0].message);
  }
};

export const triggerDemoNotification = async (
  phoneNumber: string,
  eventName:
    | 'photon:order:placed'
    | 'photon:order_fulfillment:received'
    | 'photon:order_fulfillment:ready',
  pharmacyName?: string,
  pharmacyAddress?: string
): Promise<boolean> => {
  try {
    const url = process.env.REACT_APP_THIRD_PARTY_REST_API_ENDPOINT;
    const data = {
      phoneNumber,
      eventName,
      pharmacyName,
      pharmacyAddress
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Unable to trigger demo sms');
    }

    return true;
  } catch (error) {
    throw new Error(error);
  }
};
