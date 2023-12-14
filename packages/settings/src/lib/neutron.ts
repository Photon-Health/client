import { OrganizationSettings } from '../types';

const CUREXA_ID = 'phr_01GCA54GVKA06C905DETQ9SY98';
const CAREPOINT_ID = 'phr_01GA9HPVBVJ0E65P819FD881N0';
// const ALTO_ID = 'phr_01G9CM93X1NFP1C9H9K50DPKHX';
const AMAZON_PHARMACY_ID = 'phr_01GA9HPV5XYTC1NNX213VRRBZ3';
const HONEYBEE_PHARMACY_ID = 'phr_01GA9HPXNE3TGEWPK91YY8Z4TS';
const TRUE_PILL_ID = 'phr_01HHDHKAMNMKC3CRY8VCYRVVPE';
const COSTCO_ID = 'phr_01GA9HPWTQ75YNJGFD505X5C4J';

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
  enableCourierNavigate: true,
  returnTo: window.location.origin,
  federated: false,
  enableMedHistory: false,
  enableRxAndOrder: true
};

/**
 * Org-specific settings overrides
 */

export const neutron: {
  [key: string]: OrganizationSettings;
} = {
  default: defaultSettings,

  // Test Telehealth (us)
  org_kVS7AP4iuItESdMA: {
    ...defaultSettings,
    logo: 'photon',
    accentColor: '#b35724',
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID, CAREPOINT_ID, TRUE_PILL_ID, HONEYBEE_PHARMACY_ID]
  },
  // NewCo (demo's)
  org_YiUudCToTSrjOuow: {
    ...defaultSettings,
    logo: 'newco_logo.svg',
    accentColor: '#506ef5',
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_ID],
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID]
  },
  // Demo (demo's)
  org_TY5GFYPIRo3xQGYM: {
    ...defaultSettings,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
    enablePatientRerouting: true,
    enableMedHistory: true
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
    mailOrderProviders: [CAREPOINT_ID]
  },
  // Peachy
  org_O2SLIoyyVTNXG5nX: {
    ...defaultSettings,
    logo: 'peachy_logo.png',
    accentColor: '#1D1D1F',
    pickUp: false,
    federated: true,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // MisterRx
  org_BBTs0RfOHqjpOO92: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
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
    accentColor: '#235AFF',
    enablePatientRerouting: false
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
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [COSTCO_ID]
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
  org_SgWtqCKFzYaDePCf: {
    ...defaultSettings,
    logo: 'pine_medical_logo.svg',
    accentColor: '#000000',
    enableRxAndOrder: false
  }
};
