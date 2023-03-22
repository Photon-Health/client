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
  // Test Telehealth (us)
  [process.env.REACT_APP_TEST_ORG_ID as string]: {
    sendOrder: true,
    pickUp: true,
    mailOrder: true,
    mailOrderProviders: [
      ...(process.env.REACT_APP_CUREXA_ORG_ID ? [process.env.REACT_APP_CUREXA_ORG_ID] : [])
    ],
    sendToPatient: true,
    sendToPatientUsers: []
  },
  // Demo (for product demo's)
  [process.env.REACT_APP_DEMO_ORG_ID as string]: {
    sendOrder: true,
    pickUp: true,
    mailOrder: true,
    mailOrderProviders: [
      ...(process.env.REACT_APP_CUREXA_ORG_ID ? [process.env.REACT_APP_CUREXA_ORG_ID] : [])
    ],
    sendToPatient: true,
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
      'google-oauth2|105026997775584560678', // tim
      'google-oauth2|102619324588558849301' // rado
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
  },
  // Summer Health
  [process.env.REACT_APP_SUMMER_HEALTH_ORG_ID as string]: {
    sendOrder: true,
    pickUp: false,
    mailOrder: false,
    mailOrderProviders: [],
    sendToPatient: true,
    sendToPatientUsers: []
  }
};
