export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location extends Coordinates {
  address: string;
}

const getLocation = async (
  addressOrLocation: string | Coordinates,
  geocoder: google.maps.Geocoder
): Promise<Location[]> => {
  const data = await geocoder.geocode({
    ...(typeof addressOrLocation === 'string'
      ? { address: addressOrLocation }
      : { location: { lat: addressOrLocation.latitude, lng: addressOrLocation.longitude } })
  });

  if (!data?.results?.length) {
    return [];
  }

  return data.results.map(() => ({
    latitude: data.results[0].geometry.location.lat(),
    longitude: data.results[0].geometry.location.lng(),
    address: data.results[0].formatted_address
  }));
};

export default getLocation;
