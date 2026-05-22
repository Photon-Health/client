import { gql } from '@apollo/client';
import { PHARMACY_FRAGMENT } from './pharmacies';
import { PatientFieldsFragmentMap } from '../../model/fragments';

const PatientFieldsAppFragment = PatientFieldsFragmentMap.PatientFieldsAppFragment;

export const GET_ORDER_QUERY_NAME = 'GetOrder';
export const GET_ORDER = gql`
  ${PHARMACY_FRAGMENT}
  ${PatientFieldsAppFragment}

  query ${GET_ORDER_QUERY_NAME}($id: ID!) {
    order(id: $id) {
      __typename
      id
      externalId
      state
      address {
        name {
          full
        }
        city
        country
        postalCode
        state
        street1
        street2
      }
      fills {
        id
        prescription {
          id
          dispenseQuantity
          dispenseUnit
          fillsAllowed
          instructions
        }
        treatment {
          id
          name
        }
        state
        requestedAt
        filledAt
      }
      patient {
        id
        externalId
        name {
          full
        }
        dateOfBirth
        sex
        gender
        email
        phone
        ...PatientFieldsAppFragment
      }
      pharmacy {
        ...PharmacyFragment
      }
      fulfillment {
        type
        state
        carrier
        trackingNumber
      }
      exceptions {
        type
        message
        createdAt
        resolvedAt
      }
      createdAt
    }
  }
`;
