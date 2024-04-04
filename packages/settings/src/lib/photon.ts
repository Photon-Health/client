import { OrganizationSettings } from '../types';

import {
  CUREXA_PHARMACY_ID,
  CAREPOINT_PHARMACY_ID,
  AMAZON_PHARMACY_ID,
  TAILORMADE_PHARMACY_ID,
  REDBOX_PHARMACY_ID,
  GOGOMEDS_PHARMACY_ID,
  EMPOWER_PHARMACY_ID,
  INNOVASCRIPT_PHARMACY_ID
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
  topRankedWalgreens: false,
  hideTemplates: false
};

/**
 * Org-specific settings overrides
 */

/**
 * Org-specific settings overrides
 */
export const photon = function (organizationId: string) {
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
  // Weekend Health
  org_uZPt00PG0JElhh3d: {
    ...defaultSettings,
    sendOrder: false,
    enableRxAndOrder: false
  },
  // Modern Pediatrics
  org_2utnNgp5NGCy9wOb: {
    ...defaultSettings,
    logo: 'modern_pediatrics_logo.png',
    accentColor: '#3f7a9c'
  },
  // Summer Health
  org_66nHWvQRtHbjZt4A: {
    ...defaultSettings,
    logo: 'summer_health_logo.svg',
    accentColor: '#ffc21f'
  },
  // Modern Ritual
  org_IWmodVdrQYpqh5x2: {
    ...defaultSettings,
    logo: 'modern_ritual_logo.webp',
    accentColor: '#202a36'
  },
  // Reside Health
  org_8fwLMYQGxj6Bg70X: {
    ...defaultSettings,
    logo: 'reside_health_logo.webp',
    accentColor: '#0c3276'
  },
  // Radish Health
  org_tHroj0b67F08q1yw: {
    ...defaultSettings,
    logo: 'red_radish_logo.svg',
    accentColor: '#ba4a71'
  },
  // River Health
  org_jScrLol7ZMSfExSR: {
    ...defaultSettings,
    logo: 'river_health_logo.svg',
    accentColor: '#2faef3',
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_PHARMACY_ID]
  },
  // Peachy
  org_vTC7G2EAuHgac90E: {
    ...defaultSettings,
    logo: 'peachy_logo.png',
    accentColor: '#1D1D1F',
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    federated: true,
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // ZZPeds
  org_pxcJ7Dlclcsg0OJw: {
    ...defaultSettings,
    logo: 'zzpeds_logo.png',
    accentColor: '#5271ff'
  },
  // MisterRx
  org_Frco5TQQFDHqS7xY: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false
  },
  // Mishe
  org_kLRbIfgsTXHmXDcj: {
    ...defaultSettings,
    logo: 'mishe_logo.svg',
    accentColor: '#652D92'
  },
  // Bold Health
  org_TVIFBLp7zkkDGeQI: {
    ...defaultSettings,
    logo: 'bold_health_logo.svg',
    accentColor: '#25532b'
  },
  // Piction Health
  org_v5It8IoY0RH1Rw80: {
    ...defaultSettings,
    logo: 'piction_health_logo.png',
    accentColor: '#3377e2',
    enableRxAndOrder: false
  },
  // Shapiro Medical (Xyon Health)
  org_Y0EPcd3p5eqG4iZs: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Osei Tutu (Xyon Health)
  org_WeSplxuyqxdIph1f: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Fadeyi Derm (Xyon Health)
  org_sWEo459pSKLt6wZ5: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Precision Medical Hair Restoration & Aesthetics (Xyon Health)
  org_G52mrmIBC3yqeNYB: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // California Hair Surgeon (Xyon Health)
  org_XWFD5B6e8qhCxXfN: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Ognomy
  org_2B1yxV6yS9ROqV1g: {
    ...defaultSettings,
    logo: 'ognomy_logo.webp',
    accentColor: '#0a7ade'
  },
  // Carbon Health
  org_Dye8T9VAM1GHjjzS: {
    ...defaultSettings,
    logo: 'carbon_health_logo.svg',
    accentColor: '#000000'
  },
  // Sana Care
  org_boRh5PcUzFhvyiue: {
    ...defaultSettings,
    logo: 'sana_care_logo.png',
    accentColor: '#FBCC45',
    mailOrderNavigate: false,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID],
    enableMedHistory: true
  },
  // Blueberry Pediatrics
  org_ul8ojZgvzpqu299H: {
    ...defaultSettings,
    logo: 'blueberry_logo.png',
    accentColor: '#235AFF',
    enableMedHistory: true
  },
  // TBD Health
  org_XoBVNLkIWL6BP8vZ: {
    ...defaultSettings,
    logo: 'tbd_logo.svg',
    accentColor: '#ee8155'
  },
  // Openloop Health
  org_Oxc0CSPfdiyWW3VM: {
    ...defaultSettings,
    mailOrder: true,
    pickUp: true,
    mailOrderProviders: [INNOVASCRIPT_PHARMACY_ID]
  },
  // PM Pediatrics Care
  org_2Mqu8Kf7dknKNFXb: {
    ...defaultSettings,
    logo: 'pm_pediatrics_logo.svg',
    accentColor: '#4D15B7'
  },
  // Pine Medical
  org_ZIksHxx59zFVc1Xw: {
    ...defaultSettings,
    logo: 'pine_medical_logo.svg',
    accentColor: '#000000',
    enableRxAndOrder: false
  },
  // Burdoin Mtn Medicine
  org_MYJ66XrRE3eGb12U: {
    ...defaultSettings,
    enableRxAndOrder: false
  },
  // Moment Health
  org_fdq7ceDPlQlO5e3J: {
    ...defaultSettings,
    logo: 'moment_health_logo.webp',
    accentColor: '#FF001F',
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID]
  },
  // Brightside
  org_Dcq069P9AxLlv4l2: {
    ...defaultSettings,
    logo: 'brightside_health_logo.svg',
    accentColor: '#2e4985'
  },
  // Found
  org_wM4wI7rop0W1eNfM: {
    ...defaultSettings,
    logo: 'found_logo.svg',
    accentColor: '#1c3f28'
  },
  // Sesame
  org_zc1RzzmSwd8eE94U: {
    ...defaultSettings,
    logo: 'sesame_logo.jpg',
    accentColor: '#5224C7',
    sendToPatient: true,
    enableCourierNavigate: false,
    topRankedCostco: true
  },
  // DrTelx
  org_6DKb7celAunAoLzb: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    enableRxAndOrder: false,
    mailOrderProviders: [TAILORMADE_PHARMACY_ID, GOGOMEDS_PHARMACY_ID, EMPOWER_PHARMACY_ID]
  },
  // Redbox Rx
  org_fPIzyQJhFqvBAhJG: {
    ...defaultSettings,
    logo: 'redbox_logo.jpg',
    accentColor: '#E81D21',
    mailOrder: true,
    pickUp: false,
    mailOrderProviders: [REDBOX_PHARMACY_ID]
  }
};
