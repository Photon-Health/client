import { Order } from '../utils/models';

// TODO(mrochlin) need to fix this
export const demoOrder: Order = {
  __typename: 'Order',
  readyBy: undefined,
  readyByTime: undefined,
  isReroutable: false,
  fills: [
    {
      id: 'fil_01H91JWEAPK8ZHF0H35JE59RQY',
      prescription: {
        daysSupply: 10,
        dispenseUnit: 'Tablet',
        dispenseQuantity: 20,
        dispenseAsWritten: false,
        expirationDate: '2025-11-29T00:00:00.000Z',
        fillsAllowed: 1,
        id: 'rx_01H91JW889FRF34ger7QC5V3PYBNWD0'
      },
      treatment: {
        id: 'med_01GZH4K86J1ZF85C43rf061G1DTGYZ',
        name: 'Amoxicillin Oral Tablet 875 MG'
      }
    }
  ],
  address: {
    city: 'Brooklyn',
    country: 'US',
    postalCode: '11211',
    state: 'NY',
    street1: '201 N 8th St'
  },
  organization: {
    id: 'org_YiUudCToTSrjOuow',
    name: 'NewCo'
  },
  patient: {
    id: 'pat_01H7KBFG7BQRAYQF735EWMK4CX',
    name: {
      full: 'Jessie Demo'
    }
  },
  fulfillment: undefined,
  exceptions: [],
  id: 'ord_FGHDFYT4523465346',
  pharmacy: undefined,
  state: 'ROUTING',
  fulfillments: [
    {
      id: 'ful-1',
      state: 'PROCESSING',
      exceptions: [],
      prescription: {
        daysSupply: 10,
        dispenseUnit: 'Tablet',
        dispenseQuantity: 20,
        expirationDate: '2025-11-29T00:00:00.000Z',
        fillsAllowed: 1,
        id: 'rx_01H91JW889FRF34ger7QC5V3PYBNWD0',
        treatment: {
          id: 'med_01GZH4K86J1ZF85C43rf061G1DTGYZ',
          name: 'Amoxicillin Oral Tablet 875 MG'
        }
      }
    }
  ],
  discountCards: []
};
