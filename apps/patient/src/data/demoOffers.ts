import { PHARMACY_BRANDING } from '../components/pharmacy-card-list';
import { OfferDetails } from '../utils/models';

export const demoOffers: OfferDetails[] = [
  {
    tags: [],
    deliveryEstimate: '2-3 days',
    costType: 'PRIME_RX',
    costAmount: 50,
    costAmountTitle: 'Prime Rx Price',
    retailAmount: 100,
    retailAmountTitle: 'Retail Price',
    pharmacy: {
      id: 'phr_demoAmazon',
      name: 'Amazon Pharmacy',
      fulfillmentTypes: ['MAIL_ORDER'],
      logo: PHARMACY_BRANDING['phr_demoAmazon'].logo
    }
  }
];
