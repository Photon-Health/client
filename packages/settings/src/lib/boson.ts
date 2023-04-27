import { OrganizationSettings } from '../types';

const CUREXA_ID = 'phr_01GCA54GVKA06C905DETQ9SY98';
const ALTO_ID = 'phr_01G9CM93X1NFP1C9H9K50DPKHX';

/**
 * All orgs inherit from default settings, so updates
 * to default settings can affect multiple orgs
 */

const defaultSettings: OrganizationSettings = {
  logo: undefined,
  accentColor: '#3182ce',
  sendOrder: true,
  pickUp: true,
  mailOrder: true,
  mailOrderProviders: [CUREXA_ID],
  sendToPatient: true,
  sendToPatientUsers: [],
  courier: true,
  courierProviders: [ALTO_ID],
  returnTo: window.location.origin,
  federated: false
};

/**
 * Org-specific settings overrides
 */

export const boson: {
  [key: string]: OrganizationSettings;
} = {
  default: defaultSettings,

  // Test Telehealth (us)
  org_KzSVZBQixLRkqj5d: {
    ...defaultSettings,
    logo: 'photon',
    accentColor: '#b35724'
  },
  // NewCo (demo's)
  org_w85CgjUjCi52yvOz: {
    ...defaultSettings,
    logo: 'newco_logo.png',
    accentColor: '#69348F'
  }
};
