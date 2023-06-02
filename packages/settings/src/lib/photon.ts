import { OrganizationSettings } from '../types';

// const ALTO_ID = 'phr_01G9CM93X1NFP1C9H9K50DPKHX';
const CUREXA_ID = 'phr_01GCA54GVKA06C905DETQ9SY98';
// const CAREPOINT_ID = 'phr_01GA9HPVBVJ0E65P819FD881N0';

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
  courier: false,
  courierProviders: [],
  returnTo: window.location.origin,
  federated: false
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
    sendOrder: false
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
    sendToPatient: false
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
    mailOrderProviders: [CUREXA_ID]
  },
  // Peachy
  org_vTC7G2EAuHgac90E: {
    ...defaultSettings,
    logo: 'peachy_logo.png',
    accentColor: '#1D1D1F',
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [CUREXA_ID],
    federated: true,
    sendToPatient: false
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
    mailOrderProviders: [CUREXA_ID],
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
    accentColor: '#3377e2'
  }
};
