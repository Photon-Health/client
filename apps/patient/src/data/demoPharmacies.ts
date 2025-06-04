import { EnrichedPharmacy } from '../utils/models';

export const demoDeliveryPharmacies = [
  {
    id: 'idfiasdgijdsiofjgdf',
    name: `Amazon Pharmacy`,
    // address: undefined,
    // distance: 0.5,
    // isOpen: true,
    // closes: '',
    // opens: '',
    // is24Hr: true,
    price: 24.75,
    retailPrice: 31.75,
    copayPrice: 28.35
  }
];

export const demoPickupPharmacies: EnrichedPharmacy[] = [
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
    price: 24.75,
    retailPrice: 31.75
  },
  {
    id: 'asdfsafas889767546f',
    address: {
      city: 'Brooklyn',
      country: 'US',
      postalCode: '11211',
      state: 'NY',
      street1: '121 Kent Ave'
    },
    name: 'Central Pharmacy',
    distance: 0.2,
    isOpen: true,
    closes: 'Closes 4:30PM',
    opens: 'Opens 9AM Sat',
    is24Hr: false,
    price: 22.0,
    retailPrice: 29.0
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
    name: 'Northside Pharmacy',
    distance: 0.4,
    isOpen: false,
    closes: 'Closes 7PM',
    opens: 'Opens 9AM Sat',
    is24Hr: false,
    price: 26.5,
    retailPrice: 33.5
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
    price: 29.0,
    retailPrice: 36.0
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
    price: 17.0,
    retailPrice: 24.0
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
    price: 35.0,
    retailPrice: 42.0
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
    price: 22.0,
    retailPrice: 29.0
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
    price: 32.0,
    retailPrice: 39.0
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
    price: 28.0,
    retailPrice: 35.0
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
    price: 41.0,
    retailPrice: 48.0
  }
];
