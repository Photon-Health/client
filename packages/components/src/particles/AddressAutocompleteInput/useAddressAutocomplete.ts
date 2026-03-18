import { createSignal } from 'solid-js';
import { useGoogleServiceOptional } from '../../systems/GoogleServiceProvider';

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

  const city = CITY_TYPES.reduce<string>((found, type) => found || cityByType[type] || '', '');
  const street1 = streetNumber ? `${streetNumber} ${route}` : route;
  const street2 = subpremise ? `#${subpremise}` : '';

  return { street1, street2, city, state, postalCode };
}

export function useAddressAutocomplete({ onSelect }: UseAddressAutocompleteOptions) {
  const [suggestions, setSuggestions] = createSignal<AddressSuggestion[]>([]);
  let cachedSuggestions: AddressSuggestion[] = [];
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const googleContext = useGoogleServiceOptional();

  const fetchSuggestions = (input: string) => {
    const MINIMUM_CHARACTERS_TO_SEARCH = 3;
    clearTimeout(debounceTimer);

    if (input.length < MINIMUM_CHARACTERS_TO_SEARCH) {
      setSuggestions([]);
      return;
    }

    debounceTimer = setTimeout(async () => {
      const autocompleteService = googleContext?.googleMapsServices().autocompleteService;
      if (!autocompleteService) return;

      try {
        const response = await autocompleteService.getPlacePredictions({
          input,
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });

        const mapped = (response.predictions ?? []).map((p) => ({
          placeId: p.place_id,
          description: p.description
        }));
        cachedSuggestions = mapped;
        setSuggestions(mapped);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    cachedSuggestions = [];
    setSuggestions([]);

    const geocoder = googleContext?.googleMapsServices().geocoder;
    if (!geocoder) return;

    try {
      const result = await geocoder.geocode({ placeId: suggestion.placeId });
      const place = result.results[0];
      if (place?.address_components) {
        onSelect(parseAddressComponents(place.address_components));
      }
    } catch (err) {
      console.error('Geocode failed', err);
    }
  };

  const closeSuggestions = () => {
    clearTimeout(debounceTimer);
    setSuggestions([]);
  };

  const openSuggestions = () => {
    if (cachedSuggestions.length > 0) {
      setSuggestions(cachedSuggestions);
    }
  };

  return { suggestions, fetchSuggestions, selectSuggestion, closeSuggestions, openSuggestions };
}
