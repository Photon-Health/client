import { OrganizationSettings } from '../types';

const ALTO_ID = 'phr_01G9CM93X1NFP1C9H9K50DPKHX';
const CUREXA_ID = 'phr_01GCA54GVKA06C905DETQ9SY98';

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
  sendToPatient: false,
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
    accentColor: '#3f7a9c',
    sendToPatient: true,
    courier: true,
    courierProviders: [ALTO_ID]
  },
  // Summer Health
  org_66nHWvQRtHbjZt4A: {
    ...defaultSettings,
    logo: 'summer_health_logo.svg',
    accentColor: '#ffc21f',
    sendToPatient: true
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
    accentColor: '#0c3276',
    sendToPatient: true
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
    accentColor: '#2faef3'
  },
  // Peachy
  org_vTC7G2EAuHgac90E: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
    federated: true
  },
  // ZZPeds
  org_pxcJ7Dlclcsg0OJw: {
    ...defaultSettings,
    logo: 'zzpeds_logo.png',
    accentColor: '#5271ff'
  }
};
