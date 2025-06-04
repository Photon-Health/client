import { demoDeliveryPharmacies, demoPickupPharmacies } from './demoPharmacies';
import { demoOrder } from './demoOrder';
import { DiscountCard } from '../__generated__/graphql';

// Create a discount card for each possible pharmacy selection
export const demoDiscountCards: DiscountCard[] = [
  ...demoDeliveryPharmacies,
  ...demoPickupPharmacies
].map((pharmacy) => ({
  id: `dis_${pharmacy.id}`,
  pharmacyId: pharmacy.id,
  orderId: demoOrder.id,
  price: pharmacy.price!,
  retailPrice: pharmacy.retailPrice!,
  bin: '015995',
  group: 'DR33',
  memberId: 'KER581132',
  pcn: 'GDC',
  // eslint-disable-next-line
  prescriptionId: demoOrder.fills[0].prescription!.id,
  source: 'rxsense'
}));
