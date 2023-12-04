import { OrganizationSettings } from '../types';

// const ALTO_ID = 'phr_01G9CM93X1NFP1C9H9K50DPKHX';
const CUREXA_ID = 'phr_01GCA54GVKA06C905DETQ9SY98';
const CAREPOINT_ID = 'phr_01GA9HPVBVJ0E65P819FD881N0';

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
  enablePatientRerouting: false,
  enableCourierNavigate: true,
  returnTo: window.location.origin,
  federated: false,
  enableMedHistory: false,
  enableRxAndOrder: true
};

/**
 * Org-specific settings overrides
 */

export const photon: {
  [key: string]: OrganizationSettings;
} = {
  default: defaultSettings,

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
    accentColor: '#202a36',
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Reside Health
  org_8fwLMYQGxj6Bg70X: {
    ...defaultSettings,
    logo: 'reside_health_logo.webp',
    accentColor: '#0c3276',
    enableRxAndOrder: false
  },
  // Radish Health
  org_tHroj0b67F08q1yw: {
    ...defaultSettings,
    logo: 'red_radish_logo.svg',
    accentColor: '#ba4a71',
    enableRxAndOrder: false
  },
  // River Health
  org_jScrLol7ZMSfExSR: {
    ...defaultSettings,
    logo: 'river_health_logo.svg',
    accentColor: '#2faef3',
    mailOrder: true,
    mailOrderProviders: [CAREPOINT_ID],
    enableRxAndOrder: false
  },
  // Peachy
  org_vTC7G2EAuHgac90E: {
    ...defaultSettings,
    logo: 'peachy_logo.png',
    accentColor: '#1D1D1F',
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
    federated: true,
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // ZZPeds
  org_pxcJ7Dlclcsg0OJw: {
    ...defaultSettings,
    logo: 'zzpeds_logo.png',
    accentColor: '#5271ff',
    enableRxAndOrder: false
  },
  // MisterRx
  org_Frco5TQQFDHqS7xY: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Mishe
  org_kLRbIfgsTXHmXDcj: {
    ...defaultSettings,
    logo: 'mishe_logo.svg',
    accentColor: '#652D92',
    enableRxAndOrder: false
  },
  // Bold Health
  org_TVIFBLp7zkkDGeQI: {
    ...defaultSettings,
    logo: 'bold_health_logo.svg',
    accentColor: '#25532b',
    enableRxAndOrder: false
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
    mailOrderProviders: [CUREXA_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Osei Tutu (Xyon Health)
  org_WeSplxuyqxdIph1f: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Fadeyi Derm (Xyon Health)
  org_sWEo459pSKLt6wZ5: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
    sendToPatient: false,
    enableRxAndOrder: false
  },
  // Ognomy
  org_2B1yxV6yS9ROqV1g: {
    ...defaultSettings,
    logo: 'ognomy_logo.webp',
    accentColor: '#0a7ade',
    enableRxAndOrder: false
  },
  // Carbon Health
  org_Dye8T9VAM1GHjjzS: {
    ...defaultSettings,
    logo: 'carbon_health_logo.svg',
    accentColor: '#000000',
    enableRxAndOrder: false
  },
  // Sana Care
  org_boRh5PcUzFhvyiue: {
    ...defaultSettings,
    logo: 'sana_care_logo.png',
    accentColor: '#FBCC45'
  },
  // Blueberry Pediatrics
  org_ul8ojZgvzpqu299H: {
    ...defaultSettings,
    logo: 'blueberry_logo.png',
    accentColor: '#235AFF',
    enablePatientRerouting: false,
    enableMedHistory: true
  },
  // TBD Health
  org_XoBVNLkIWL6BP8vZ: {
    ...defaultSettings,
    logo: 'tbd_logo.svg',
    accentColor: '#ee8155',
    enableRxAndOrder: false
  },
  // Openloop Health
  org_Oxc0CSPfdiyWW3VM: {
    ...defaultSettings,
    logo: 'openloop_logo.png',
    accentColor: '#E90C54',
    enableRxAndOrder: false
  },
  // PM Pediatrics Care
  org_2Mqu8Kf7dknKNFXb: {
    ...defaultSettings,
    logo: 'pm_pediatrics_logo.svg',
    accentColor: '#4D15B7',
    enableRxAndOrder: false
  }
};
