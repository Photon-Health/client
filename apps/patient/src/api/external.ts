const geocoder: google.maps.Geocoder = new google.maps.Geocoder();

export const geocode = async (address: string) => {
  const request: google.maps.GeocoderRequest = { address };

  try {
    const response: google.maps.GeocoderResponse = await geocoder.geocode(request);

    const result = response.results?.[0];
    if (result?.geometry?.location) {
      const zipcode = result.address_components?.find((component) =>
        component.types.includes('postal_code')
      )?.long_name;

      return {
        address: result.formatted_address,
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
        zipcode: zipcode || null
      };
    } else {
      throw new Error('No results found for the provided address.');
    }
  } catch (error: any) {
    throw new Error(error);
  }
};
