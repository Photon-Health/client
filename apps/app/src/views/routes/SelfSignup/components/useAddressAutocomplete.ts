import { useCallback, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export interface ParsedAddress {
  street1: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface AddressSuggestion {
  placeId: string;
  description: string;
}

interface UseAddressAutocompleteOptions {
  onSelect: (address: ParsedAddress) => void;
}

export function useAddressAutocomplete({ onSelect }: UseAddressAutocompleteOptions) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const getService = () => {
    if (!autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
    }
    return autocompleteService.current;
  };

  const getGeocoder = () => {
    if (!geocoder.current) {
      geocoder.current = new google.maps.Geocoder();
    }
    return geocoder.current;
  };

  const fetchSuggestions = useDebouncedCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await getService().getPlacePredictions({
        input,
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      setSuggestions(
        (response.predictions ?? []).map((p) => ({
          placeId: p.place_id,
          description: p.description
        }))
      );
    } catch {
      setSuggestions([]);
    }
  }, 300);

  const selectSuggestion = useCallback(async (suggestion: AddressSuggestion) => {
    setSuggestions([]);

    try {
      const result = await getGeocoder().geocode({ placeId: suggestion.placeId });
      const place = result.results[0];
      if (place?.address_components) {
        onSelectRef.current(parseAddressComponents(place.address_components));
      }
    } catch (err) {
      console.error('Geocode failed', err);
    }
  }, []);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  return { suggestions, fetchSuggestions, selectSuggestion, clearSuggestions };
}

// City-type components in priority order. Google returns multiple types per
// component (e.g. ["sublocality_level_1", "sublocality", "political"]),
// and different addresses use different type names for what humans consider
// the "city". We pick the highest-priority match.
const CITY_TYPES = [
  'locality', // most US addresses
  'sublocality_level_1', // NYC boroughs (Brooklyn, Queens, etc.)
  'sublocality', // other sub-city areas
  'neighborhood', // rare fallback
  'administrative_area_level_2' // unincorporated county areas
] as const;

function parseAddressComponents(components: google.maps.GeocoderAddressComponent[]): ParsedAddress {
  let streetNumber = '';
  let route = '';
  const cityByType: Partial<Record<(typeof CITY_TYPES)[number], string>> = {};
  let state = '';
  let postalCode = '';

  for (const component of components) {
    const types = component.types;
    if (types.includes('street_number')) {
      streetNumber = component.long_name;
    } else if (types.includes('route')) {
      route = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = component.short_name;
    } else if (types.includes('postal_code')) {
      postalCode = component.long_name;
    } else {
      for (const cityType of CITY_TYPES) {
        if (types.includes(cityType)) {
          cityByType[cityType] = component.long_name;
          break;
        }
      }
    }
  }

  // Pick the highest-priority city match
  const city = CITY_TYPES.reduce<string>((found, type) => found || cityByType[type] || '', '');

  const street1 = streetNumber ? `${streetNumber} ${route}` : route;
  return { street1, city, state, postalCode };
}
