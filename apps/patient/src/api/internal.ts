import { types } from 'packages/sdk/dist/lib';

import { graphQLClient } from '../configs/graphqlClient';
import {
  GET_ORDER,
  GET_PHARMACIES,
  GET_PHARMACIES_WITH_PRICE,
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
  name,
  includePrice
}: {
  searchParams: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  limit: number;
  offset: number;
  isOpenNow: boolean;
  is24hr: boolean;
  name?: string;
  includePrice?: boolean;
}) => {
  try {
    const now = new Date();

    // either the pharmaciesByLocation or pharmaciesWithPriceByLocation query is used
    // depending on the includePrice flag
    const query = includePrice ? GET_PHARMACIES_WITH_PRICE : GET_PHARMACIES;
    const variables = {
      location: {
        radius: 100,
        ...searchParams
      },
      openAt: isOpenNow ? now : undefined,
      is24hr,
      ...(!includePrice ? { limit, offset, name } : {})
    };

    const response: {
      pharmaciesByLocation: types.Pharmacy[];
      pharmaciesWithPriceByLocation: { pharmacy: types.Pharmacy; price: number }[];
    } = await graphQLClient.request(query, variables);

    if (response?.pharmaciesByLocation?.length > 0) {
      return response.pharmaciesByLocation;
    }

    if (response?.pharmaciesWithPriceByLocation?.length > 0) {
      // this query returns an array of objects with pharmacy and price side by side
      // so I'm combining them into a single object to be compatible with the rest of the interface
      return response.pharmaciesWithPriceByLocation.map(({ pharmacy, price }) => ({
        ...pharmacy,
        price
      }));
    }

    return [];
  } catch (e: any) {
    const errorMessage =
      e?.response?.errors?.[0]?.message ?? 'Unknown error occurred on getPharmacies.';
    throw new Error(errorMessage);
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
  } catch (e: any) {
    const errorMessage =
      e?.response?.errors?.[0]?.message ?? 'Unknown error occurred on markOrderAsPickedUp.';
    throw new Error(errorMessage);
  }
};

export const rerouteOrder = async (orderId: string, pharmacyId: string) => {
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
  } catch (e: any) {
    const errorMessage =
      e?.response?.errors?.[0]?.message ?? 'Unknown error occurred on rerouteOrder.';
    throw new Error(errorMessage);
  }
};

export const setOrderPharmacy = async (
  orderId: string,
  pharmacyId: string,
  readyBy?: string,
  readyByDay?: string,
  readyByTime?: string
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
  } catch (e: any) {
    const errorMessage =
      e?.response?.errors?.[0]?.message ?? 'Unknown error occurred on setOrderPharmacy.';
    throw new Error(errorMessage);
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
  } catch (e: any) {
    const errorMessage =
      e?.response?.errors?.[0]?.message ?? 'Unknown error occurred on setPreferredPharmacy.';
    throw new Error(errorMessage);
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
  const url = process.env.REACT_APP_THIRD_PARTY_REST_API_ENDPOINT;
  const data = {
    phoneNumber,
    eventName,
    pharmacyName,
    pharmacyAddress
  };

  const response = await fetch(url!, {
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
};
