import { OrganizationSettings } from '../types';

import {
  CUREXA_PHARMACY_ID,
  CAREPOINT_PHARMACY_ID,
  AMAZON_PHARMACY_ID,
  TAILORMADE_PHARMACY_ID,
  REDBOX_PHARMACY_ID,
  GOGOMEDS_PHARMACY_ID,
  EMPOWER_PHARMACY_ID,
  INNOVASCRIPT_PHARMACY_ID,
  AMBROSIA_PHARMACY_ID,
  WOMENS_INTERNATIONAL_PHARMACY_ID,
  REDROCK_SPRINGVILLE_PHARMACY_ID,
  REDROCK_STGEORGE_PHARMACY_ID,
  COST_PLUS_PHARMACY_ID,
  WALMART_MAIL_ORDER_PHARMACY_ID
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
export const photon = function (organizationId: string | undefined) {
  if (organizationId && organizationSettings[organizationId]) {
    return {
      ...defaultSettings,
      ...organizationSettings[organizationId]
    };
  }
  return defaultSettings;
};

/**
 * Org-specific settings overrides
 */

const organizationSettings: {
  [key: string]: OrganizationSettings;
} = {
  // Photon Test Account
  org_xqL46CdX49O1K5Ye: {
    mailOrder: true,
    pickUp: true,
    mailOrderProviders: [REDROCK_SPRINGVILLE_PHARMACY_ID, REDROCK_STGEORGE_PHARMACY_ID]
  },
  // Weekend Health
  org_uZPt00PG0JElhh3d: {
    sendOrder: false,
    enableRxAndOrder: false
  },
  // Modern Pediatrics
  org_2utnNgp5NGCy9wOb: {
    logo: 'modern_pediatrics_logo.png',
    accentColor: '#3f7a9c'
  },
  // Summer Health
  org_66nHWvQRtHbjZt4A: {
    logo: 'summer_health_logo.svg',
    accentColor: '#ffc21f'
  },
  // Modern Ritual
  org_IWmodVdrQYpqh5x2: {
    logo: 'modern_ritual_logo.webp',
    accentColor: '#202a36'
  },
  // Reside Health
  org_8fwLMYQGxj6Bg70X: {
    logo: 'reside_health_logo.webp',
    accentColor: '#0c3276'
  },
  // Radish Health
  org_tHroj0b67F08q1yw: {
    logo: 'red_radish_logo.svg',
    accentColor: '#ba4a71'
  },
  // River Health
  org_jScrLol7ZMSfExSR: {
    logo: 'river_health_logo.svg',
    accentColor: '#2faef3',
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_PHARMACY_ID]
  },
  // Peachy
  org_vTC7G2EAuHgac90E: {
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
    logo: 'zzpeds_logo.png',
    accentColor: '#5271ff'
  },
  // MisterRx
  org_Frco5TQQFDHqS7xY: {
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false
  },
  // Mishe
  org_kLRbIfgsTXHmXDcj: {
    logo: 'mishe_logo.svg',
    accentColor: '#652D92'
  },
  // Bold Health
  org_TVIFBLp7zkkDGeQI: {
    logo: 'bold_health_logo.svg',
    accentColor: '#25532b'
  },
  // Piction Health
  org_v5It8IoY0RH1Rw80: {
    logo: 'piction_health_logo.png',
    accentColor: '#3377e2',
    enableRxAndOrder: false
  },
  // Shapiro Medical (Xyon Health)
  org_Y0EPcd3p5eqG4iZs: {
    sendOrder: false,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Osei Tutu (Xyon Health)
  org_WeSplxuyqxdIph1f: {
    sendOrder: false,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Fadeyi Derm (Xyon Health)
  org_sWEo459pSKLt6wZ5: {
    sendOrder: false,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Precision Medical Hair Restoration & Aesthetics (Xyon Health)
  org_G52mrmIBC3yqeNYB: {
    sendOrder: false,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Gabel Center (Xyon Health)
  org_CFRRTHpFWmTjUjdP: {
    sendOrder: false,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // California Hair Surgeon (Xyon Health)
  org_XWFD5B6e8qhCxXfN: {
    sendOrder: true,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Anderson HSC (Xyon Health)
  org_mFPQdGzFZibbkFd7: {
    sendOrder: false,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Ognomy
  org_2B1yxV6yS9ROqV1g: {
    logo: 'ognomy_logo.webp',
    accentColor: '#0a7ade'
  },
  // Carbon Health
  org_Dye8T9VAM1GHjjzS: {
    logo: 'carbon_health_logo.svg',
    accentColor: '#000000'
  },
  // Sana Care
  org_boRh5PcUzFhvyiue: {
    logo: 'sana_care_logo.png',
    accentColor: '#FBCC45',
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [
      AMAZON_PHARMACY_ID,
      COST_PLUS_PHARMACY_ID,
      WALMART_MAIL_ORDER_PHARMACY_ID
    ],
    enableMedHistory: true
  },
  // Blueberry Pediatrics
  org_ul8ojZgvzpqu299H: {
    logo: 'blueberry_logo.png',
    accentColor: '#235AFF',
    enableMedHistory: true,
    topRankedWalgreens: true
  },
  // TBD Health
  org_XoBVNLkIWL6BP8vZ: {
    logo: 'tbd_logo.svg',
    accentColor: '#ee8155'
  },
  // Openloop Health
  org_Oxc0CSPfdiyWW3VM: {
    mailOrder: true,
    pickUp: true,
    mailOrderProviders: [INNOVASCRIPT_PHARMACY_ID]
  },
  // PM Pediatrics Care
  org_2Mqu8Kf7dknKNFXb: {
    logo: 'pm_pediatrics_logo.svg',
    accentColor: '#4D15B7'
  },
  // Pine Medical
  org_ZIksHxx59zFVc1Xw: {
    logo: 'pine_medical_logo.svg',
    accentColor: '#000000',
    enableRxAndOrder: false
  },
  // Burdoin Mtn Medicine
  org_MYJ66XrRE3eGb12U: {
    enableRxAndOrder: false
  },
  // Moment Health
  org_fdq7ceDPlQlO5e3J: {
    logo: 'moment_health_logo.webp',
    accentColor: '#FF001F',
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID]
  },
  // Brightside
  org_Dcq069P9AxLlv4l2: {
    logo: 'brightside_health_logo.svg',
    accentColor: '#2e4985'
  },
  // Found
  org_wM4wI7rop0W1eNfM: {
    logo: 'found_logo.svg',
    accentColor: '#1c3f28'
  },
  // Sesame
  org_zc1RzzmSwd8eE94U: {
    logo: 'sesame_logo.jpg',
    accentColor: '#5224C7',
    topRankedCostco: true,
    paExceptionMessage:
      'Your insurance needs additional information from your provider before it will cover your prescription. Use the messaging feature in your Sesame profile to ask your provider to submit a prior authorization. If you’re paying cash, disregard and work with your pharmacy directly to pay the out-of-pocket price.'
  },
  // DrTelx
  org_6DKb7celAunAoLzb: {
    pickUp: false,
    mailOrder: true,
    enableRxAndOrder: false,
    sendToPatient: false,
    mailOrderProviders: [
      TAILORMADE_PHARMACY_ID,
      GOGOMEDS_PHARMACY_ID,
      EMPOWER_PHARMACY_ID,
      AMBROSIA_PHARMACY_ID,
      WOMENS_INTERNATIONAL_PHARMACY_ID
    ]
  },
  // Redbox Rx
  org_fPIzyQJhFqvBAhJG: {
    logo: 'redbox_logo.jpg',
    accentColor: '#E81D21',
    mailOrder: true,
    pickUp: false,
    mailOrderProviders: [REDBOX_PHARMACY_ID]
  },
  // Great Many
  org_gvTsxeeYy97qedaS: {
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID]
  },
  // Counsel Health
  org_YVKjNwccHKUm3DIa: {
    logo: 'counsel_logo.png',
    accentColor: '#333333'
  },
  // Measured
  org_pcPnPx5PVamzjS2p: {
    sendToPatient: true,
    pickUp: true,
    mailOrder: true,
    mailOrderProviders: [
      REDROCK_SPRINGVILLE_PHARMACY_ID,
      REDROCK_STGEORGE_PHARMACY_ID,
      EMPOWER_PHARMACY_ID
    ],
    logo: 'measured_logo.svg',
    accentColor: '#ffd100'
  }
};
