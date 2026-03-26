import { EnrichedPharmacy } from '../utils/models';
import { GetPharmaciesQuery } from '../__generated__/graphql';

export const demoPharmacies: EnrichedPharmacy[] = [
  {
    id: 'asdfsafas889767546f',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '121 Kent Ave'
    },
    price: 52,
    retailPrice: 100,
    name: 'Central Pharmacy',
    distance: 0.2,
    isOpen: true,
    closes: 'Closes 4:30PM',
    opens: 'Opens 9AM Sat',
    is24Hr: false,
    fulfillmentTypes: ['PICK_UP']
  },
  {
    id: 'as4563456dfsafasdf',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '559 Driggs Ave'
    },
    price: 80,
    retailPrice: 100,
    name: 'Northside Pharmacy',
    distance: 0.4,
    isOpen: false,
    closes: 'Closes 7PM',
    opens: 'Opens 9AM Sat',
    is24Hr: false,
    fulfillmentTypes: ['PICK_UP']
  },
  {
    id: 'asdfsa2435236fasdf',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '250 Bedford Ave'
    },
    name: `Walgreens Pharmacy`,
    distance: 0.5,
    isOpen: true,
    closes: '',
    opens: '',
    is24Hr: true,
    fulfillmentTypes: ['PICK_UP']
  },
  {
    id: 'as324gfdsf5236fasdf',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '27 N 6th St'
    },
    name: `CVS Pharmacy`,
    distance: 0.8,
    isOpen: true,
    closes: 'Closes 6PM',
    opens: 'Opens 9AM Tue',
    is24Hr: false,
    fulfillmentTypes: ['PICK_UP']
  },
  {
    id: 'as324gf6h5ehgrgsdf',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '250 Bedford Ave'
    },
    name: `Duane Reade Pharmacy`,
    distance: 1.0,
    isOpen: true,
    closes: '',
    opens: '',
    is24Hr: true,
    fulfillmentTypes: ['PICK_UP']
  },
  {
    id: 'as324gf6h6g45wgrfwefrgsdf',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '205 N 9th St'
    },
    name: `Organic Planet Pharmacy`,
    distance: 1.1,
    isOpen: true,
    closes: 'Closes 4:30PM',
    opens: 'Opens 9AM Sat',
    is24Hr: false,
    fulfillmentTypes: ['PICK_UP']
  },
  {
    id: 'as324gf65j5hgersdf',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '556 Grand St'
    },
    name: `United Pharmacy`,
    distance: 1.1,
    isOpen: true,
    closes: 'Closes 4:30PM',
    opens: 'Opens 9AM Sat',
    is24Hr: false,
    fulfillmentTypes: ['PICK_UP']
  },
  {
    id: 'a328798frfafgf',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '255 S 2nd St'
    },
    name: `Santa Maria Pharmacy`,
    distance: 1.4,
    isOpen: false,
    closes: 'Closes 4:30PM',
    opens: 'Opens 9AM Sat',
    is24Hr: false,
    fulfillmentTypes: ['PICK_UP']
  },
  {
    id: 'a32843y6hgwrgwrtgwgf',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '258 Bedford Ave'
    },
    name: `Walgreens Pharmacy`,
    distance: 1.5,
    isOpen: true,
    closes: '',
    opens: '',
    is24Hr: true,
    fulfillmentTypes: ['PICK_UP']
  },
  {
    id: 'a3284334t54gdgdfwrtgwgf',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '682 Grand St'
    },
    name: `Sisto Pharmacy`,
    distance: 2.1,
    isOpen: true,
    closes: 'Closes 4:30PM',
    opens: 'Opens 9AM Sat',
    is24Hr: false,
    fulfillmentTypes: ['PICK_UP']
  }
];

export const demoMailOrderPharmacies: GetPharmaciesQuery['pharmacies'] = [
  {
    id: 'phr_demoCapsule',
    name: 'Capsule Pharmacy',
    logo: 'https://logos.boson.health/pharmacies/capsule-logo.png',
    fulfillmentTypes: ['MAIL_ORDER']
  },
  {
    id: 'phr_demoCvsCaremark',
    name: 'CVS Caremark',
    logo: 'https://logos.boson.health/pharmacies/cvs-caremark-logo.png',
    fulfillmentTypes: ['MAIL_ORDER']
  },
  {
    id: 'phr_demoEvernorthEnguide',
    name: 'Evernorth Enguide Pharmacy',
    logo: 'https://logos.boson.health/pharmacies/evernorth-logo.png',
    fulfillmentTypes: ['MAIL_ORDER']
  },
  {
    id: 'phr_demoExpressScripts',
    name: 'Express Scripts Pharmacy ',
    logo: 'https://logos.boson.health/pharmacies/express-scripts-logo.png',
    fulfillmentTypes: ['MAIL_ORDER']
  },
  {
    id: 'phr_demoFuzerxHayward',
    name: 'FuzeRx Hayward',
    logo: 'https://logos.boson.health/pharmacies/truepill-logo.png',
    fulfillmentTypes: ['MAIL_ORDER']
  },
  {
    id: 'phr_demoMarkCubanCostPlusDrugs',
    name: 'Mark Cuban Cost Plus Drugs',
    logo: 'https://logos.boson.health/pharmacies/costplus-logo.png',
    fulfillmentTypes: ['MAIL_ORDER']
  },
  {
    id: 'phr_demoNovocare',
    name: 'Novocare Pharmacy',
    logo: 'https://logos.neutron.health/pharmacies/novo-nordisk.png',
    fulfillmentTypes: ['MAIL_ORDER']
  },
  {
    id: 'phr_demoOptumrx',
    name: 'Optumrx ',
    logo: 'https://logos.boson.health/pharmacies/optum-logo.png',
    fulfillmentTypes: ['MAIL_ORDER']
  }
];
