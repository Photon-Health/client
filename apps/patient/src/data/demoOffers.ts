import { PHARMACY_BRANDING } from '../components/pharmacy-card-list';
import { OfferBundleComplete } from '../utils/models';

export const demoOffers: OfferBundleComplete[] = [
  {
    source: 'AMAZON_PHARMACY',
    isPromoted: true,
    tags: [],
    deliveryEstimate: '2-3 days',
    costAmount: 50,
    costAmountTitle: 'Prime Rx Price',
    retailAmount: 100,
    retailAmountTitle: 'Retail Price',
    pharmacy: {
      id: 'phr_demoAmazon',
      name: 'Amazon Pharmacy',
      fulfillmentTypes: ['MAIL_ORDER'],
      logo: PHARMACY_BRANDING['phr_demoAmazon'].logo
    },
    medications: [{ name: 'Lisinopril 10mg Tablet', amount: 50, retailAmount: 100 }]
  }
];
