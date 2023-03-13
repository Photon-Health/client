export interface Address {
  street1: string;
  street2?: string;
  postalCode: string;
  country: string;
  state: string;
  city: string;
}

export type FulfillmentSettings = {
  [key: string]: {
    sendOrder: boolean;
    pickUp: boolean;
    mailOrder: boolean;
    mailOrderProviders: string[];
    sendToPatient: boolean;
    sendToPatientUsers: string[];
  };
};
