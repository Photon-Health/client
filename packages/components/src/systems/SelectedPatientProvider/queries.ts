import { gql } from '@apollo/client';
import { Address } from '@photonhealth/sdk/dist/types';

export type PreferredPharmacy = {
  id: string;
  name: string;
  address: Pick<Address, 'street1' | 'city' | 'state'>;
};

export interface GetPreferredPharmaciesResponse {
  patient: {
    address: Address;
    preferredPharmacies: PreferredPharmacy[];
  };
}

export const GetLastOrderQuery = gql`
  query GetLastOrder($id: ID!) {
    orders(filter: { patientId: $id }, first: 1) {
      createdAt
      pharmacy {
        id
        name
        address {
          street1
          street2
          city
          state
          postalCode
        }
      }
    }
  }
`;

type PharmacyOrder = {
  id: string;
  name: string;
  address: Address;
};

export interface GetLastOrderResponse {
  orders: {
    createdAt: string;
    pharmacy: PharmacyOrder;
  }[];
}
