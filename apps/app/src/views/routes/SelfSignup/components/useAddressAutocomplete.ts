import { useCallback, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export interface ParsedAddress {
  street1: string;
  street2: string;
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
  const cachedSuggestions = useRef<AddressSuggestion[]>([]);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

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
    const MINIMUM_CHARACTERS_TO_SEARCH = 3;
    if (input.length < MINIMUM_CHARACTERS_TO_SEARCH) {
      // clears dropdown when there are only a few characters
      setSuggestions([]);
      return;
    }

    try {
      const response = await getService().getPlacePredictions({
        input,
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      const mapped = (response.predictions ?? []).map((p) => ({
        placeId: p.place_id,
        description: p.description
      }));
      cachedSuggestions.current = mapped;
      setSuggestions(mapped);
    } catch {
      setSuggestions([]);
    }
  }, 300);

  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    cachedSuggestions.current = [];
    setSuggestions([]);

    try {
      const result = await getGeocoder().geocode({ placeId: suggestion.placeId });
      const place = result.results[0];
      if (place?.address_components) {
        onSelect(parseAddressComponents(place.address_components));
      }
    } catch (err) {
      console.error('Geocode failed', err);
    }
  };

  const closeSuggestions = useCallback(() => {
    fetchSuggestions.cancel();
    setSuggestions([]);
  }, [fetchSuggestions]);

  const openSuggestions = useCallback(() => {
    if (cachedSuggestions.current.length > 0) {
      setSuggestions(cachedSuggestions.current);
    }
  }, []);

  return { suggestions, fetchSuggestions, selectSuggestion, closeSuggestions, openSuggestions };
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
  let subpremise = '';
  const cityByType: Partial<Record<(typeof CITY_TYPES)[number], string>> = {};
  let state = '';
  let postalCode = '';

  for (const component of components) {
    const types = component.types;
    if (types.includes('subpremise')) {
      subpremise = component.long_name;
    } else if (types.includes('street_number')) {
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
  const street2 = subpremise ? `#${subpremise}` : '';
  return { street1, street2, city, state, postalCode };
}
