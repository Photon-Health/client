import { graphQLClient } from '../configs/graphqlClient';

export const AUTH_HEADER_ERRORS = ['EMPTY_AUTHORIZATION_HEADER', 'INVALID_AUTHORIZATION_HEADER'];

/**
 * Queries
 */

export const getOrder = async (orderId: string) => {
  // Not wrapped in try/catch so error handling can be done in Main
  const response = await graphQLClient.GetOrder({ id: orderId });
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
    zipCode: string;
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

    return await graphQLClient.GetPharmaciesByLocation({
      location: {
        radius: 100,
        ...searchParams
      },
      openAt: isOpenNow ? now : undefined,
      is24hr,
      limit,
      offset,
      name,
      includePrice: includePrice ?? false
    });
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
    const response = await graphQLClient.MarkOrderAsPickedUp({
      markOrderAsPickedUpId: orderId
    });
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

export const rerouteOrder = async (
  orderId: string,
  pharmacyId: string,
  patientSelectedPrice: boolean
) => {
  try {
    const response = await graphQLClient.RerouteOrder({
      orderId,
      pharmacyId,
      patientSelectedPrice
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
  readyByTime?: Date,
  patientSelectedPrice?: boolean
) => {
  try {
    const response = await graphQLClient.SetOrderPharmacy({
      pharmacyId,
      orderId,
      readyBy,
      readyByDay,
      readyByTime,
      patientSelectedPrice
    });

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
    const response = await graphQLClient.SetPreferredPharmacy({
      patientId,
      pharmacyId
    });

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
