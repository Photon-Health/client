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
        dispenseUnit: 'ML',
        dispenseQuantity: '100 ML' as unknown as number, // Make it format nicely for demo
        dispenseAsWritten: false,
        expirationDate: '2024-08-29T00:00:00.000Z',
        fillsAllowed: 1,
        id: 'rx_01H91JW889FRF34ger7QC5V3PYBNWD0'
      },
      treatment: {
        id: 'med_01GZH4K86J1ZF85C43rf061G1DTGYZ',
        name: 'amoxicillin 400 MG in 5 mL Oral Suspension'
      }
    },
    {
      id: 'fil_01sH91JWEAPK8ZHF0H35sfwe3JE59RQY',
      prescription: {
        daysSupply: 2,
        dispenseUnit: 'tablets',
        dispenseQuantity: '2 tablets' as unknown as number,
        dispenseAsWritten: false,
        expirationDate: '2024-08-29T00:00:00.000Z',
        fillsAllowed: 1,
        id: 'rx_01H9154tgJW889FRF7QC5V3PYBNWD0'
      },
      treatment: {
        id: 'med_01GZH4K86J1ZF85C061G14fe4DTGYZ',
        name: 'dexamethasone 6 MG Oral Tablet'
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
        daysSupply: 2,
        dispenseUnit: 'tablets',
        dispenseQuantity: '2 tablets' as unknown as number,
        expirationDate: '2024-08-29T00:00:00.000Z',
        fillsAllowed: 1,
        id: 'rx_01H9154tgJW889FRF7QC5V3PYBNWD0',
        treatment: {
          id: 'med_01GZH4K86J1ZF85C061G14fe4DTGYZ',
          name: 'dexamethasone 6 MG Oral Tablet'
        }
      }
    },
    {
      id: 'ful-2',
      state: 'PROCESSING',
      exceptions: [],
      prescription: {
        daysSupply: 10,
        dispenseUnit: 'ML',
        dispenseQuantity: '100 ML' as unknown as number, // Make it format nicely for demo
        expirationDate: '2024-08-29T00:00:00.000Z',
        fillsAllowed: 1,
        id: 'rx_01H91JW889FRF34ger7QC5V3PYBNWD0',
        treatment: {
          id: 'med_01GZH4K86J1ZF85C43rf061G1DTGYZ',
          name: 'amoxicillin 400 MG in 5 mL Oral Suspension'
        }
      }
    }
  ],
  discountCards: []
};
