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

export const fulfillmentSettings: FulfillmentSettings = {
  default: {
    sendOrder: true,
    pickUp: true,
    mailOrder: true,
    mailOrderProviders: [
      ...(process.env.REACT_APP_CUREXA_ORG_ID ? [process.env.REACT_APP_CUREXA_ORG_ID] : [])
    ],
    sendToPatient: true,
    sendToPatientUsers: []
  }
};
