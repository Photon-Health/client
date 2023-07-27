const geocoder: google.maps.Geocoder = new google.maps.Geocoder();
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
