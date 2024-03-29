import { OrganizationSettings } from '../types';

import {
  CUREXA_PHARMACY_ID,
  CAREPOINT_PHARMACY_ID,
  AMAZON_PHARMACY_ID,
  TRUEPILL_PHARMACY_ID,
  HONEYBEE_PHARMACY_ID,
  EMPOWER_PHARMACY_ID,
  COSTCO_PHARMACY_ID,
  REDBOX_PHARMACY_ID,
  GOGOMEDS_PHARMACY_ID,
  TAILORMADE_PHARMACY_ID
} from '../pharmacies';

/**
 * All orgs inherit from default settings, so updates
 * to default settings can affect multiple orgs
 */

const defaultSettings: OrganizationSettings = {
  logo: undefined,
  accentColor: '#3182ce',
  sendOrder: true,
  pickUp: true,
  mailOrder: false,
  mailOrderProviders: [],
  mailOrderNavigate: false,
  mailOrderNavigateProviders: [],
  sendToPatient: true,
  sendToPatientUsers: [],
  enablePatientRerouting: true,
  enableCourierNavigate: false,
  returnTo: window.location.origin,
  federated: false,
  enableMedHistory: false,
  enableRxAndOrder: true,
  enableCombineAndDuplicate: true,
  topRankedCostco: false,
  hideTemplates: false
};

/**
 * Org-specific settings overrides
 */

export const neutron = function (organizationId: string) {
  if (organizationSettings[organizationId]) {
    return organizationSettings[organizationId];
  }
  return defaultSettings;
};

/**
 * Org-specific settings overrides
 */

const organizationSettings: {
  [key: string]: OrganizationSettings;
} = {
  // Test Telehealth (us)
  org_kVS7AP4iuItESdMA: {
    ...defaultSettings,
    accentColor: '#b35724',
    mailOrder: true,
    enableMedHistory: true,
    mailOrderProviders: [
      CUREXA_PHARMACY_ID,
      CAREPOINT_PHARMACY_ID,
      TRUEPILL_PHARMACY_ID,
      HONEYBEE_PHARMACY_ID,
      GOGOMEDS_PHARMACY_ID
    ],
    topRankedCostco: true
  },
  // NewCo (demo's)
  org_YiUudCToTSrjOuow: {
    ...defaultSettings,
    logo: 'newco_logo.svg',
    accentColor: '#506ef5',
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_PHARMACY_ID],
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID]
  },
  // Demo (demo's)
  org_TY5GFYPIRo3xQGYM: {
    ...defaultSettings,
    logo: 'sesame_logo.jpg',
    accentColor: '#5224C7',
    enableCourierNavigate: false,
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [COSTCO_PHARMACY_ID]
  },
  // Weekend Health
  org_u93EDGhy5I4Ia5Bb: {
    ...defaultSettings,
    sendOrder: false,
    enableRxAndOrder: false
  },
  // Modern Pediatrics
  org_XiV8H4uCFu6QFUov: {
    ...defaultSettings,
    logo: 'modern_pediatrics_logo.png',
    accentColor: '#3f7a9c'
  },
  // Summer Health
  org_jr5fT3Mh4zCFsVQA: {
    ...defaultSettings,
    logo: 'summer_health_logo.svg',
    accentColor: '#ffc21f'
  },
  // Modern Ritual
  org_0WP4tWCftMEM7K2q: {
    ...defaultSettings,
    logo: 'modern_ritual_logo.webp',
    accentColor: '#202a36'
  },
  // Radish Health
  org_kBuUKySvfFeWLovJ: {
    ...defaultSettings,
    logo: 'red_radish_logo.svg',
    accentColor: '#ba4a71'
  },
  // River Health
  org_U3ofDUVRsNTYt7d8: {
    ...defaultSettings,
    logo: 'river_health_logo.svg',
    accentColor: '#2faef3',
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_PHARMACY_ID]
  },
  // Peachy
  org_O2SLIoyyVTNXG5nX: {
    ...defaultSettings,
    logo: 'peachy_logo.png',
    accentColor: '#1D1D1F',
    pickUp: false,
    federated: true,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // MisterRx
  org_BBTs0RfOHqjpOO92: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false
  },
  // Emily's Test environment (us)
  org_KPfcKzFtfzD3ISxW: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [HONEYBEE_PHARMACY_ID],
    sendToPatient: false
  },
  // Blueberry Pediatrics
  org_vISrdMELQC3MhOFb: {
    ...defaultSettings,
    logo: 'blueberry_logo.png',
    accentColor: '#235AFF'
  },
  // Sunny
  org_PILXReL8NKiTWxD3: {
    ...defaultSettings,
    logo: 'sunny_logo.svg',
    accentColor: '#69672c'
  },
  // One Medical
  org_FDug4lPgyekFRNby: {
    ...defaultSettings,
    logo: 'one_medical.jpeg',
    accentColor: '#005450'
  },
  // Carbon Health
  org_jzJhkJH2D4kyJD0q: {
    ...defaultSettings,
    logo: 'carbon_health_logo.svg',
    accentColor: '#000000'
  },
  // Oak Street Health
  org_lXk4CKXWokY1rvnC: {
    ...defaultSettings,
    logo: 'oak_st_health.png',
    accentColor: '#00694c'
  },
  // Heartbeat Health
  org_6M1pULWU4O5AK3Lg: {
    ...defaultSettings,
    logo: 'heartbeat_health_logo.svg',
    accentColor: '#d1007e'
  },
  // Harbor Health
  org_1BNRl6kcTIZQg4ip: {
    ...defaultSettings,
    logo: 'harbor_health_logo.png',
    accentColor: '#141d45'
  },
  // Assure Health
  org_RPrHGTLipYfPywxf: {
    ...defaultSettings,
    logo: 'assure_health_logo.svg',
    accentColor: '#66cca9'
  },
  // Found
  org_PwzQxriG4OcMD0iq: {
    ...defaultSettings,
    logo: 'found_logo.svg',
    accentColor: '#1c3f28'
  },
  // Miga Health
  org_u3kKBHGj4MFfzOVz: {
    ...defaultSettings,
    logo: 'miga_health_logo.svg',
    accentColor: '#12110c'
  },
  // Sesame
  org_QFoulY6Ornx7dMdw: {
    ...defaultSettings,
    logo: 'sesame_logo.jpg',
    accentColor: '#5224C7',
    enableCourierNavigate: false,
    topRankedCostco: true
  },
  // Oshi Health
  org_yOgsgGMBVUZIBcwp: {
    ...defaultSettings,
    logo: 'oshi_logo.svg',
    accentColor: '#3b5b80'
  },
  // TBD Health
  org_kI58h1e86jYO37LQ: {
    ...defaultSettings,
    logo: 'tbd_logo.svg',
    accentColor: '#ee8155'
  },
  // Openloop Health
  org_t5lbHt9eb9gMeeeb: {
    ...defaultSettings,
    logo: 'openloop_logo.png',
    accentColor: '#E90C54'
  },
  // Piction Health
  org_aE5uK35xUqfDjMD4: {
    ...defaultSettings,
    logo: 'piction_health_logo.png',
    accentColor: '#3377e2',
    enableRxAndOrder: false
  },
  // Pine Medical
  org_AJ6WSTbag7RCfi0N: {
    ...defaultSettings,
    logo: 'pine_medical_logo.svg',
    accentColor: '#000000',
    enableRxAndOrder: false,
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [EMPOWER_PHARMACY_ID]
  },
  // Brightside
  org_Dcq069P9AxLlv4l2: {
    ...defaultSettings,
    logo: 'brightside_health_logo.svg',
    accentColor: '#2e4985'
  },
  // Twentyeight Health
  org_WhLKXXfPPwq8R4vX: {
    ...defaultSettings,
    logo: 'twentyeight_health_logo.svg',
    accentColor: '#f48273',
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID]
  },
  // Frontier Direct Care
  org_b37dAjtODQmdded8: {
    ...defaultSettings,
    logo: 'frontier_direct_care_logo.png',
    accentColor: '#6AA2B9'
  },
  // Circle Medical
  org_pEJMB30hbJuCzyJL: {
    ...defaultSettings,
    logo: 'circle_medical_logo.svg',
    accentColor: '#0c70e9'
  },
  // Transcarent
  org_YqcUHY5azUJyXll6: {
    ...defaultSettings,
    logo: 'transcarent_logo.png',
    accentColor: '#3d409a'
  },
  // Maven Clinic
  org_bZxIVsm8jqwLqPVr: {
    ...defaultSettings,
    logo: 'maven_logo.svg',
    accentColor: '#00856f'
  },
  // Grow Therapy
  org_8QvehhOF7G5SFgK0: {
    ...defaultSettings,
    logo: 'grow_therapy_logo.svg',
    accentColor: '#c0b0ff'
  },
  // Superpower
  org_8J3sxe0csVpM5oZr: {
    ...defaultSettings,
    logo: 'superpower_logo.svg',
    accentColor: '#111111'
  },
  // Hera Fertility
  org_GSTGr8n2QWwygTWS: {
    ...defaultSettings,
    logo: 'hera_fertility_logo.svg',
    accentColor: '#2a769e'
  },
  // Redbox Rx
  org_1orA5KZ4dOtDwVsC: {
    ...defaultSettings,
    logo: 'redbox_logo.jpg',
    accentColor: '#E81D21',
    mailOrder: true,
    pickUp: false,
    mailOrderProviders: [REDBOX_PHARMACY_ID]
  },
  // Lifeforce
  org_3QjCdlUhKYD3Y5Xd: {
    ...defaultSettings,
    logo: 'lifeforce_logo.jpeg',
    accentColor: '#e08433',
    mailOrder: true,
    mailOrderProviders: [TAILORMADE_PHARMACY_ID, GOGOMEDS_PHARMACY_ID]
  },
  // Sana
  org_nWFRQpF5fK1Fd0Ap: {
    ...defaultSettings,
    logo: 'sana_care_logo.png',
    accentColor: '#FBCC45',
    mailOrderNavigate: false,
    enableMedHistory: true
  }
};
