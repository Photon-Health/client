import { Address } from '@photonhealth/sdk/dist/types';

export const hasUsableAddress = (
  address?: Pick<Address, 'id' | 'street1' | 'city' | 'state' | 'postalCode'>
) => {
  if (!address) {
    return false;
  }

  return Boolean(
    address.street1?.trim() &&
      address.city?.trim() &&
      address.state?.trim() &&
      address.postalCode?.trim()
  );
};
