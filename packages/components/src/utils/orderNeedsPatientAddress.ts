import { AddressInput, FulfillmentType } from '@photonhealth/sdk/dist/types';
import { hasUsableAddress } from './hasUsableAddress';

/**
 * Calculate whether prescriber is allowed to create an order
 * without a patient address specified.
 */
export const orderNeedsPatientAddress = ({
  optionalPatientAddress,
  fulfillmentType,
  orderAddressOverride
}: {
  optionalPatientAddress?: boolean;
  fulfillmentType?: string;
  orderAddressOverride: AddressInput | null;
}) => {
  const validAddressOverride = orderAddressOverride
    ? hasUsableAddress(orderAddressOverride)
    : false;

  // If a valid order address is passed to the prescribe element,
  // we'll ALWAYS attach that address to the order
  // so no patient address is needed.
  if (validAddressOverride) {
    return false;
  }

  if (optionalPatientAddress) {
    // Certain types of orders ALWAYS require a patient address.
    return fulfillmentNeedsAddress(fulfillmentType);
  }

  // If patient address is always required
  // and no valid order address override was provided
  // we need a patient address.
  return true;
};

const fulfillmentNeedsAddress = (fulfillmentType?: string) => {
  return (
    fulfillmentType === FulfillmentType.PickUp || fulfillmentType === FulfillmentType.MailOrder
  );
};
