import { Fill } from 'packages/sdk/dist/types';
import { FillState } from 'packages/sdk/src/types';
import { Order } from '../utils/models';

// TODO(mrochlin) need to fix this
export const demoOrder: Order = {
  fills: [
    {
      id: 'fil_01H91JWEAPK8ZHF0H35JE59RQY',
      prescription: {
        daysSupply: 10,
        dispenseQuantity: '100 ML',
        expirationDate: '2024-08-29T00:00:00.000Z',
        fillsAllowed: 1,
        id: 'rx_01H91JW889FRF34ger7QC5V3PYBNWD0'
      },
      treatment: {
        id: 'med_01GZH4K86J1ZF85C43rf061G1DTGYZ',
        name: 'amoxicillin 400 MG in 5 mL Oral Suspension',
        codes: {
          __typename: undefined,
          HCPCS: undefined,
          SKU: undefined,
          packageNDC: undefined,
          productNDC: undefined,
          rxcui: undefined
        }
      },
      quantity: '100 ML',
      strength: '10 mg/10mL',
      order: { id: 'ord_FGHDFYT4523465346' } as Order,
      requestedAt: '2023',
      state: FillState.New
    } as unknown as Fill,
    {
      id: 'fil_01sH91JWEAPK8ZHF0H35sfwe3JE59RQY',
      prescription: {
        daysSupply: 2,
        dispenseQuantity: '2 tablets',
        expirationDate: '2024-08-29T00:00:00.000Z',
        fillsAllowed: 1,
        id: 'rx_01H9154tgJW889FRF7QC5V3PYBNWD0'
      },
      treatment: {
        id: 'med_01GZH4K86J1ZF85C061G14fe4DTGYZ',
        name: 'dexamethasone 6 MG Oral Tablet',
        codes: {
          __typename: undefined,
          HCPCS: undefined,
          SKU: undefined,
          packageNDC: undefined,
          productNDC: undefined,
          rxcui: undefined
        }
      },
      strength: '10 mg/10mL',
      requestedAt: '2023',
      state: FillState.New
    } as unknown as Fill
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
  fulfillment: null,
  id: 'ord_FGHDFYT4523465346',
  pharmacy: null,
  state: 'ROUTING',
  createdAt: '2023'
} as unknown as Order;
