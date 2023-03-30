import { FulfillmentSettings } from '../models/general';

export const fulfillmentSettings: FulfillmentSettings = {
  default: {
    sendOrder: true,
    pickUp: true,
    mailOrder: true,
    mailOrderProviders: [
      ...(process.env.REACT_APP_CUREXA_ORG_ID ? [process.env.REACT_APP_CUREXA_ORG_ID] : [])
    ],
    sendToPatient: false,
    sendToPatientUsers: []
  }
};
