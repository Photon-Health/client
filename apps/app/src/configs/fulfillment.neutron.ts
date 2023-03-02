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
    sendOrder: false,
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
    sendToPatient: true,
    sendToPatientUsers: [
      ...(process.env.REACT_APP_TIM_USER_ID ? [process.env.REACT_APP_TIM_USER_ID] : [])
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
