export enum Envs {
  boson = 'boson',
  neutron = 'neutron',
  photon = 'photon'
}
type FulfillmentConfig = {
  [key in Envs]: {
    [key: string]: {
      sendOrder: boolean;
      pickUp: boolean;
      mailOrder: boolean;
      mailOrderProviders: string[];
      sendToPatient: boolean;
      sendToPatientUsers: string[];
    };
  };
};

export const fulfillmentConfig: FulfillmentConfig = {
  boson: {
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
  },
  neutron: {
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
  },
  photon: {
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
      sendToPatient: true,
      sendToPatientUsers: [
        ...(process.env.REACT_APP_TIM_USER_ID ? [process.env.REACT_APP_TIM_USER_ID] : []),
        ...(process.env.REACT_APP_SARA_USER_ID ? [process.env.REACT_APP_SARA_USER_ID] : [])
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
  }
};
