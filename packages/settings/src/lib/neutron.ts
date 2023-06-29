import { OrganizationSettings } from '../types';

const CUREXA_ID = 'phr_01GCA54GVKA06C905DETQ9SY98';
const CAREPOINT_ID = 'phr_01GA9HPVBVJ0E65P819FD881N0';
const ALTO_ID = 'phr_01G9CM93X1NFP1C9H9K50DPKHX';
// const AMAZON_PHARMACY_ID = 'phr_01GA9HPV5XYTC1NNX213VRRBZ3';

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
    mailOrderProviders: [CUREXA_ID, CAREPOINT_ID],
    courier: true,
    courierProviders: [ALTO_ID]
  },
  // NewCo (demo's)
  org_YiUudCToTSrjOuow: {
    ...defaultSettings,
    logo: 'newco_logo.png',
    accentColor: '#69348F'
  },
  // Demo (demo's)
  org_TY5GFYPIRo3xQGYM: {
    ...defaultSettings,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID]
  },
  // Weekend Health
  org_u93EDGhy5I4Ia5Bb: {
    ...defaultSettings,
    sendOrder: false
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
    accentColor: '#202a36',
    sendToPatient: false
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
    sendToPatient: false
  },
  // MisterRx
  org_BBTs0RfOHqjpOO92: {
    ...defaultSettings,
    pickUp: false,
    mailOrder: true,
    mailOrderProviders: [CUREXA_ID],
    sendToPatient: false
  }
};
