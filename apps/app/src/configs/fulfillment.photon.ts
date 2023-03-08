import { FulfillmentSettings } from '../models/general';

export const fulfillmentSettings: FulfillmentSettings = {
  default: {
    sendOrder: true,
    pickUp: true,
    mailOrder: false,
    mailOrderProviders: [],
    sendToPatient: false,
    sendToPatientUsers: []
  },
  // Weekend Health
  [process.env.REACT_APP_WEEKEND_ORG_ID as string]: {
    sendOrder: false,
    pickUp: true,
    mailOrder: false,
    mailOrderProviders: [],
    sendToPatient: false,
    sendToPatientUsers: []
  },
  // Modern Pediatrics
  [process.env.REACT_APP_MODERN_PEDIATRICS_ORG_ID as string]: {
    sendOrder: true,
    pickUp: true,
    mailOrder: false,
    mailOrderProviders: [],
    sendToPatient: false, // disabled for org
    sendToPatientUsers: [
      // enabled for these users
      'google-oauth2|105026997775584560678', // Tim
      'google-oauth2|109153884033500835980' // Sara
    ]
  },
  // Peachy
  [process.env.REACT_APP_PEACHY_ORG_ID as string]: {
    sendOrder: true,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [
      ...(process.env.REACT_APP_CUREXA_ORG_ID ? [process.env.REACT_APP_CUREXA_ORG_ID] : [])
    ],
    sendToPatient: false,
    sendToPatientUsers: []
  }
};
