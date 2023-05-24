import { OrganizationSettings } from '../types';

const CUREXA_ID = 'phr_01GCA54GVKA06C905DETQ9SY98';
const CAREPOINT_ID = 'phr_01GA9HPVBVJ0E65P819FD881N0';
const ALTO_ID = 'phr_01G9CM93X1NFP1C9H9K50DPKHX';
const AMAZON_PHARMACY_ID = 'phr_01GA9HPV5XYTC1NNX213VRRBZ3'; // double-check this

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
  mailOrderProviders: [CUREXA_ID, CAREPOINT_ID],
  mailOrderNavigate: false,
  mailOrderNavigateProviders: [],
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
    // mailOrderNavigate: true,
    // mailOrderNavigateProviders: [AMAZON_PHARMACY_ID]
  },
  // NewCo (demo's)
  org_w85CgjUjCi52yvOz: {
    ...defaultSettings,
    logo: 'newco_logo.png',
    accentColor: '#69348F',
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID]
  }
};
