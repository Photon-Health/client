import { OrganizationSettings } from '../types';

import {
  CUREXA_PHARMACY_ID,
  CAREPOINT_PHARMACY_ID,
  AMAZON_PHARMACY_ID,
  TRUEPILL_PHARMACY_ID,
  HONEYBEE_PHARMACY_ID,
  EMPOWER_PHARMACY_ID,
  REDBOX_PHARMACY_ID,
  GOGOMEDS_PHARMACY_ID,
  TAILORMADE_PHARMACY_ID,
  AMBROSIA_PHARMACY_ID,
  WOMENS_INTERNATIONAL_PHARMACY_ID,
  REDROCK_SPRINGVILLE_PHARMACY_ID,
  FOOTHILLS_PHARMACY_ID,
  SMARTSCRIPTS_PHARMACY_ID,
  OLYMPIA_PHARMACY_ID,
  REDROCK_STGEORGE_PHARMACY_ID,
  COST_PLUS_PHARMACY_ID,
  WALMART_MAIL_ORDER_PHARMACY_ID,
  HEALTHWAREHOUSE_PHARMACY_ID,
  STRIVE_PHARMACY_ID,
  OPENLOOP_PHARMACY_ID,
  GIFTHEALTH_PHARMACY_ID,
  EPIQ_PHARMACY_ID,
  PHOTON_TEST_PHARMACY_ID,
  DANIA_PHARMACY_ID
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
  enablePricing: false,
  topRankedCostco: false,
  topRankedWalgreens: false,
  hideTemplates: false
};

/**
 * Org-specific settings overrides
 */

export const neutron = function (organizationId: string | undefined) {
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
  // Test Telehealth (us)
  org_kVS7AP4iuItESdMA: {
    accentColor: '#b35724',
    mailOrder: true,
    enableMedHistory: true,
    enablePricing: true,
    mailOrderProviders: [
      CUREXA_PHARMACY_ID,
      CAREPOINT_PHARMACY_ID,
      TRUEPILL_PHARMACY_ID,
      HONEYBEE_PHARMACY_ID,
      GOGOMEDS_PHARMACY_ID,
      REDROCK_SPRINGVILLE_PHARMACY_ID,
      FOOTHILLS_PHARMACY_ID,
      SMARTSCRIPTS_PHARMACY_ID,
      OLYMPIA_PHARMACY_ID,
      HEALTHWAREHOUSE_PHARMACY_ID,
      STRIVE_PHARMACY_ID,
      OPENLOOP_PHARMACY_ID,
      GIFTHEALTH_PHARMACY_ID,
      EMPOWER_PHARMACY_ID,
      PHOTON_TEST_PHARMACY_ID,
      DANIA_PHARMACY_ID
    ],
    topRankedWalgreens: true,
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [
      AMAZON_PHARMACY_ID,
      COST_PLUS_PHARMACY_ID,
      WALMART_MAIL_ORDER_PHARMACY_ID
    ]
  },
  // NewCo (demo's)
  org_YiUudCToTSrjOuow: {
    logo: 'newco_logo.svg',
    accentColor: '#506ef5',
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_PHARMACY_ID],
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID]
  },
  // Demo (demo's)
  org_TY5GFYPIRo3xQGYM: {
    logo: 'newco_logo.svg',
    accentColor: '#506ef5',
    enableCourierNavigate: false,
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID]
  },
  // RO health
  org_OY9R92S8roPh0hlX: {
    logo: 'ro_logo.png',
    accentColor: '#506ef5'
  },
  // Weekend Health
  org_u93EDGhy5I4Ia5Bb: {
    sendOrder: false,
    enableRxAndOrder: false
  },
  // Modern Pediatrics
  org_XiV8H4uCFu6QFUov: {
    logo: 'modern_pediatrics_logo.png',
    accentColor: '#3f7a9c'
  },
  // Summer Health
  org_jr5fT3Mh4zCFsVQA: {
    logo: 'summer_health_logo.svg',
    accentColor: '#ffc21f'
  },
  // Modern Ritual
  org_0WP4tWCftMEM7K2q: {
    logo: 'modern_ritual_logo.webp',
    accentColor: '#202a36'
  },
  // Radish Health
  org_kBuUKySvfFeWLovJ: {
    logo: 'red_radish_logo.svg',
    accentColor: '#ba4a71'
  },
  // River Health
  org_U3ofDUVRsNTYt7d8: {
    logo: 'river_health_logo.svg',
    accentColor: '#2faef3',
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_PHARMACY_ID]
  },
  // Peachy
  org_O2SLIoyyVTNXG5nX: {
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
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false
  },
  // DrTelx
  org_XwCIUzcnim5PfPJa: {
    pickUp: false,
    mailOrder: true,
    enableRxAndOrder: false,
    sendToPatient: false,
    mailOrderProviders: [
      TAILORMADE_PHARMACY_ID,
      GOGOMEDS_PHARMACY_ID,
      EMPOWER_PHARMACY_ID,
      AMBROSIA_PHARMACY_ID,
      WOMENS_INTERNATIONAL_PHARMACY_ID,
      STRIVE_PHARMACY_ID
    ]
  },
  // Emily's Test environment (us)
  org_KPfcKzFtfzD3ISxW: {
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [HONEYBEE_PHARMACY_ID],
    sendToPatient: false
  },
  // Blueberry Pediatrics
  org_vISrdMELQC3MhOFb: {
    logo: 'blueberry_logo.png',
    accentColor: '#235AFF'
  },
  // Sunny
  org_PILXReL8NKiTWxD3: {
    logo: 'sunny_logo.svg',
    accentColor: '#69672c'
  },
  // One Medical
  org_FDug4lPgyekFRNby: {
    logo: 'one_medical.jpeg',
    accentColor: '#005450'
  },
  // Carbon Health
  org_jzJhkJH2D4kyJD0q: {
    logo: 'carbon_health_logo.svg',
    accentColor: '#000000'
  },
  // Oak Street Health
  org_lXk4CKXWokY1rvnC: {
    logo: 'oak_st_health.png',
    accentColor: '#00694c'
  },
  // Heartbeat Health
  org_6M1pULWU4O5AK3Lg: {
    logo: 'heartbeat_health_logo.svg',
    accentColor: '#d1007e'
  },
  // Harbor Health
  org_1BNRl6kcTIZQg4ip: {
    logo: 'harbor_health_logo.png',
    accentColor: '#141d45'
  },
  // Assure Health
  org_RPrHGTLipYfPywxf: {
    logo: 'assure_health_logo.svg',
    accentColor: '#66cca9'
  },
  // Found
  org_PwzQxriG4OcMD0iq: {
    logo: 'found_logo.svg',
    accentColor: '#1c3f28',
    mailOrderProviders: [STRIVE_PHARMACY_ID]
  },
  // Miga Health
  org_u3kKBHGj4MFfzOVz: {
    logo: 'miga_health_logo.svg',
    accentColor: '#12110c'
  },
  // Sesame
  org_QFoulY6Ornx7dMdw: {
    logo: 'sesame_logo.jpg',
    accentColor: '#5224C7',
    topRankedCostco: true,
    mailOrder: true,
    mailOrderProviders: [FOOTHILLS_PHARMACY_ID],
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID],
    paExceptionMessage:
      'Your insurance needs additional information from your provider before it will cover your prescription. Use the messaging feature in your Sesame profile to ask your provider to submit a prior authorization. If you’re paying cash, disregard and work with your pharmacy directly to pay the out-of-pocket price.'
  },
  // Oshi Health
  org_yOgsgGMBVUZIBcwp: {
    logo: 'oshi_logo.svg',
    accentColor: '#3b5b80'
  },
  // TBD Health
  org_kI58h1e86jYO37LQ: {
    logo: 'tbd_logo.svg',
    accentColor: '#ee8155'
  },
  // Openloop Health
  org_t5lbHt9eb9gMeeeb: {
    logo: 'openloop_logo.png',
    accentColor: '#E90C54'
  },
  // Piction Health
  org_aE5uK35xUqfDjMD4: {
    logo: 'piction_health_logo.png',
    accentColor: '#3377e2',
    enableRxAndOrder: false
  },
  // Pine Medical
  org_AJ6WSTbag7RCfi0N: {
    logo: 'pine_medical_logo.svg',
    accentColor: '#000000',
    enableRxAndOrder: false,
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [EMPOWER_PHARMACY_ID]
  },
  // Brightside
  org_Dcq069P9AxLlv4l2: {
    logo: 'brightside_health_logo.svg',
    accentColor: '#2e4985'
  },
  // Twentyeight Health
  org_tA6GiBBgGBZwnf4e: {
    logo: 'twentyeight_health_logo.svg',
    accentColor: '#f48273',
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [
      AMAZON_PHARMACY_ID,
      TRUEPILL_PHARMACY_ID,
      CAREPOINT_PHARMACY_ID,
      HONEYBEE_PHARMACY_ID
    ]
  },
  // Frontier Direct Care
  org_b37dAjtODQmdded8: {
    logo: 'frontier_direct_care_logo.png',
    accentColor: '#6AA2B9'
  },
  // Circle Medical
  org_pEJMB30hbJuCzyJL: {
    logo: 'circle_medical_logo.svg',
    accentColor: '#0c70e9'
  },
  // Transcarent
  org_YqcUHY5azUJyXll6: {
    logo: 'transcarent_logo.png',
    accentColor: '#3d409a'
  },
  // Maven Clinic
  org_bZxIVsm8jqwLqPVr: {
    logo: 'maven_logo.svg',
    accentColor: '#00856f'
  },
  // Grow Therapy
  org_8QvehhOF7G5SFgK0: {
    logo: 'grow_therapy_logo.svg',
    accentColor: '#c0b0ff'
  },
  // Superpower
  org_8J3sxe0csVpM5oZr: {
    logo: 'superpower_logo.svg',
    accentColor: '#111111'
  },
  // Hera Fertility
  org_GSTGr8n2QWwygTWS: {
    logo: 'hera_fertility_logo.svg',
    accentColor: '#2a769e'
  },
  // Redbox Rx
  org_1orA5KZ4dOtDwVsC: {
    logo: 'redbox_logo.jpg',
    accentColor: '#E81D21',
    mailOrder: true,
    pickUp: false,
    mailOrderProviders: [REDBOX_PHARMACY_ID]
  },
  // Lifeforce
  org_3QjCdlUhKYD3Y5Xd: {
    logo: 'lifeforce_logo.jpeg',
    accentColor: '#e08433',
    mailOrder: true,
    mailOrderProviders: [TAILORMADE_PHARMACY_ID, GOGOMEDS_PHARMACY_ID]
  },
  // Sana
  org_nWFRQpF5fK1Fd0Ap: {
    logo: 'sana_care_logo.svg',
    accentColor: '#FBCC45',
    enableMedHistory: true,
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID],
    enableCourierNavigate: true
  },
  // GoalMD
  org_4CKpLMduRVMHl2Ft: {
    mailOrder: true,
    mailOrderProviders: [HONEYBEE_PHARMACY_ID, TRUEPILL_PHARMACY_ID]
  },
  // Great Many
  org_3IVuVvEdKSStmAig: {
    mailOrder: true,
    pickUp: false,
    sendToPatient: false,
    mailOrderProviders: [CUREXA_PHARMACY_ID]
  },
  // Xyon Health
  org_t9KbrhuLYSeZaqLK: {
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Xyon Health 2 (for Eric Liu)
  org_Nic6tFhWwlsnCvjc: {
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Counsel Health
  org_srLyKiKZhbYToD6C: {
    logo: 'counsel_logo.svg',
    accentColor: '#333333'
  },
  // Measured
  org_CsGKYnFZbMI3SY3X: {
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
  },
  // Berry Street
  org_utUz7i0OsFKN7m33: {
    sendToPatient: true,
    pickUp: true,
    mailOrder: true,
    mailOrderProviders: [CUREXA_PHARMACY_ID]
  },
  // Miiskin integration testing account
  org_VWgnbn3MVynEjoND: {
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_PHARMACY_ID, HONEYBEE_PHARMACY_ID, TRUEPILL_PHARMACY_ID]
  },
  // Miiskin Sandbox test sub-org
  org_HyrPueFq0JFqQIuf: {
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_PHARMACY_ID, HONEYBEE_PHARMACY_ID, TRUEPILL_PHARMACY_ID]
  },
  // Fifty 410
  org_DFsDnAmXkPrtsrih: {
    mailOrder: true,
    mailOrderProviders: [HEALTHWAREHOUSE_PHARMACY_ID, EMPOWER_PHARMACY_ID],
    logo: 'fifty410_logo.png',
    accentColor: '#CB7052'
  },
  // Precision telemed
  org_wmy57WStnHIFXBAr: {
    mailOrder: true,
    mailOrderProviders: [EMPOWER_PHARMACY_ID]
  },
  // Remedymeds
  org_YNHdqbbgnRWrsS9I: {
    logo: 'remedymeds_logo.png',
    mailOrder: true,
    mailOrderProviders: [EPIQ_PHARMACY_ID]
  }
};
