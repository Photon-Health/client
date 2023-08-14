import { types } from '@photonhealth/sdk';
import { formatAddress } from '../utils/general';

const geocoder: google.maps.Geocoder = new google.maps.Geocoder();
const placesService = new google.maps.places.PlacesService(document.createElement('div'));

export const geocode = async (address: string) => {
  const request: google.maps.GeocoderRequest = { address };

  try {
    const response: google.maps.GeocoderResponse = await geocoder.geocode(request);

    const result = response.results?.[0];
    if (result?.geometry?.location) {
      return {
        address: result.formatted_address,
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng()
      };
    } else {
      throw new Error('No results found for the provided address.');
    }
  } catch (error) {
    switch (error.message) {
      case google.maps.GeocoderStatus.UNKNOWN_ERROR:
        throw new Error('Unknown server error occurred.');
      case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
        throw new Error('Exceeded the query limit. Please try again later.');
      case google.maps.GeocoderStatus.ZERO_RESULTS:
        throw new Error('No result was found.');
      case google.maps.GeocoderStatus.REQUEST_DENIED:
        throw new Error('Geocoding request denied. Check your API key and permissions.');
      case google.maps.GeocoderStatus.INVALID_REQUEST:
        throw new Error('Invalid geocoding request.');
      default:
        throw error; // Re-throw any other unexpected errors
    }
  }
};

interface QueryResponse<T> {
  response: T;
  status: string;
}
const query = (method: string, data: object) =>
  new Promise<QueryResponse<any>>((resolve, reject) => {
    placesService[method](data, (response: any, status: string) => {
      if (status === 'OK') {
        resolve({ response, status });
      } else {
        reject(new Error(`Google Places API error: ${status}`));
      }
    });
  });

interface PlaceResponse {
  place_id: string;
}
export const getPlaceId = async (pharmacy: types.Pharmacy): Promise<string | undefined> => {
  const address = pharmacy.address ? formatAddress(pharmacy.address) : '';
  const placeQuery = pharmacy.name + ' ' + address;
  const placeRequest = {
    query: placeQuery,
    fields: ['place_id']
  };

  try {
    const { response, status }: { response: PlaceResponse[]; status: string } = await query(
      'findPlaceFromQuery',
      placeRequest
    );
    if (status === 'OK' && response[0]?.place_id) {
      return response[0].place_id;
    }
    return undefined;
  } catch (error) {
    throw new Error(`Failed to get place ID: ${error.message}`);
  }
};

interface PlaceDetailsResponse {
  opening_hours?: {
    periods: Array<{ close: { day: number; time: string }; open: { day: number; time: string } }>;
    isOpen(): boolean;
  };
  utc_offset_minutes?: number;
  rating?: number;
  business_status?: string;
}
export const getPlaceDetails = async (
  placeId: string
): Promise<PlaceDetailsResponse | undefined> => {
  const detailsRequest = {
    placeId,
    fields: ['opening_hours', 'utc_offset_minutes', 'rating', 'business_status']
  };

  try {
    const { response, status }: { response: PlaceDetailsResponse; status: string } = await query(
      'getDetails',
      detailsRequest
    );
    if (status === 'OK') {
      return response;
    }
    return undefined;
  } catch (error) {
    throw new Error(`Failed to get place details: ${error.message}`);
  }
};
