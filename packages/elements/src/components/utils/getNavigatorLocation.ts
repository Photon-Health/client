type GeolocationOptions = {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
};

export default async function getNavigatorLocation(
  options: GeolocationOptions = {}
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          reject(error);
        },
        options
      );
    } else {
      reject(new Error('Geolocation not supported'));
    }
  });
}
