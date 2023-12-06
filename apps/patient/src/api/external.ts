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

interface QueryHelperResponse<T> {
  response: T;
  status: string;
}
const placeQuery = (method: string, data: object) =>
  new Promise<QueryHelperResponse<any>>((resolve, reject) => {
    placesService[method](data, (response: any, status: string) => {
      if (status === 'OK') {
        resolve({ response, status });
      } else {
        reject(new Error(`Google Places API error: ${status}`));
      }
    });
  });

interface PlaceResponse {
  place_id?: string;
  types?: string[];
  business_status?: string;
  rating?: number;
}
export const getPlace = async (
  query: string,
  fields: string[]
): Promise<PlaceResponse | undefined> => {
  try {
    const { response, status }: { response: PlaceResponse[]; status: string } = await placeQuery(
      'findPlaceFromQuery',
      { query, fields }
    );
    if (status === 'OK' && response[0]) {
      return response[0];
    }
    return undefined;
  } catch (error) {
    throw new Error(error);
  }
};
