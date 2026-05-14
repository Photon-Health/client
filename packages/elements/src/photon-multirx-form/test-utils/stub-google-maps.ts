/// <reference types="google.maps" />
import { vi } from 'vitest';
import LatLngBounds = google.maps.LatLngBounds;

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

export function makeGeocodeResult(
  lat: number,
  lng: number,
  formattedAddress: string
): google.maps.GeocoderResult {
  return {
    address_components: [],
    place_id: 'stub-google-maps-place-id',
    types: [],
    geometry: {
      location: {
        lat: () => lat,
        lng: () => lng,
        equals: vi.fn(),
        toJSON: vi.fn(),
        toUrlValue: vi.fn()
      },
      location_type: google.maps.GeocoderLocationType.APPROXIMATE,
      viewport: new LatLngBounds()
    },
    formatted_address: formattedAddress
  };
}
