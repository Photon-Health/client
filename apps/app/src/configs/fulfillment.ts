export const fulfillmentConfig = {
  default: {
    sendOrder: true,
    pickUp: true,
    mailOrder: true,
    mailOrderProviders: [process.env.REACT_APP_CUREXA_ORG_ID],
    sendToPatient: true
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
    sendToPatientUsers: ['usr_01GBMTH3CTDFWECGK2QGCH66SR', 'usr_01GFBXC3D128A8J0FPR5Y4V6JE']
  },
  // Peachy
  [process.env.REACT_APP_PEACHY_ORG_ID as string]: {
    sendOrder: true,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [process.env.REACT_APP_CUREXA_ORG_ID],
    sendToPatient: false,
    sendToPatientUsers: []
  }
};
