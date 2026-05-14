/// <reference types="google.maps" />
import { vi } from 'vitest';

/**
 * Stubs `window.google.maps` so code paths that touch the Google Maps SDK
 * (Geocoder, places.AutocompleteService) don't blow up in jsdom. Pass
 * `geocodeResults` when the test exercises the local-pharmacy search feature and
 * needs the Geocoder to return real coordinates.
 */
export function stubGoogleMaps(geocodeResults: google.maps.GeocoderResult[] = []) {
  Object.defineProperty(window, 'google', {
    configurable: true,
    writable: true,
    value: {
      maps: {
        Geocoder: class Geocoder {
          geocode = vi.fn(async () => ({ results: geocodeResults }));
        },
        places: { AutocompleteService: class AutocompleteService {} }
      }
    }
  });
}

/** Builds a minimal Geocoder result for `stubGoogleMaps`. */
export function makeGeocodeResult(
  lat: number,
  lng: number,
  formattedAddress: string
): google.maps.GeocoderResult {
  return {
    geometry: {
      location: { lat: () => lat, lng: () => lng } as google.maps.LatLng
    } as google.maps.GeocoderGeometry,
    formatted_address: formattedAddress
  } as google.maps.GeocoderResult;
}
