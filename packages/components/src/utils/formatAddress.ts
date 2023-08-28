import { Address } from '@photonhealth/sdk/dist/types';
import { toTitleCase } from './toTitleCase';

function formatAddress(address?: Address | null) {
  if (!address) return '';
  const { city, postalCode, state, street1, street2 } = address;
  return `${toTitleCase(street1)}${street2 ? `, ${toTitleCase(street2)}` : ''}, ${toTitleCase(
    city
  )}, ${state} ${postalCode || ''}`;
}

export default formatAddress;
