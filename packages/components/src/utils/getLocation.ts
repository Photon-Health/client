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
): Promise<Location> => {
  const data = await geocoder!.geocode({
    ...(typeof addressOrLocation === 'string'
      ? { address: addressOrLocation }
      : { location: { lat: addressOrLocation.latitude, lng: addressOrLocation.longitude } })
  });

  const latitude = data.results[0].geometry.location.lat();
  const longitude = data.results[0].geometry.location.lng();
  const formattedAddress = data.results[0].formatted_address;

  return { latitude, longitude, address: formattedAddress };
};

export default getLocation;
