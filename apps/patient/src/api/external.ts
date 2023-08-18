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
    throw new Error(error);
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
  types: string[];
  business_status: string;
  rating?: number;
}
export const getPlace = async (
  pharmacy: types.Pharmacy,
  includeRating = true
): Promise<PlaceResponse | undefined> => {
  const address = pharmacy.address ? formatAddress(pharmacy.address) : '';
  const placeQuery = pharmacy.name + ' ' + address;
  const placeFields = [
    'place_id',
    'business_status',
    'types',
    ...(includeRating ? ['rating'] : [])
  ];
  const placeRequest = {
    query: placeQuery,
    fields: placeFields
  };

  try {
    const { response, status }: { response: PlaceResponse[]; status: string } = await query(
      'findPlaceFromQuery',
      placeRequest
    );
    if (status === 'OK' && response[0]) {
      return response[0];
    }
    return undefined;
  } catch (error) {
    throw new Error(error);
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
    fields: ['opening_hours', 'utc_offset_minutes']
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
