import { useEffect, useRef } from 'react';

export interface ParsedAddress {
  street1: string;
  city: string;
  state: string;
  postalCode: string;
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

function parseAddressComponents(place: google.maps.places.PlaceResult): ParsedAddress {
  const components = place.address_components ?? [];
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

interface UseAddressAutocompleteOptions {
  onSelect: (address: ParsedAddress) => void;
}

export function useAddressAutocomplete({ onSelect }: UseAddressAutocompleteOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.address_components) {
        onSelectRef.current(parseAddressComponents(place));
      }
    });

    autocompleteRef.current = autocomplete;
  }, []);

  return { inputRef };
}
