import { OrganizationSettings } from '../types';
import {
  CUREXA_PHARMACY_ID,
  CAREPOINT_PHARMACY_ID,
  AMAZON_PHARMACY_ID,
  TRUEPILL_PHARMACY_ID,
  HONEYBEE_PHARMACY_ID
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
  mailOrder: true,
  mailOrderProviders: [
    CUREXA_PHARMACY_ID,
    CAREPOINT_PHARMACY_ID,
    TRUEPILL_PHARMACY_ID,
    HONEYBEE_PHARMACY_ID
  ],
  mailOrderNavigate: false,
  mailOrderNavigateProviders: [],
  sendToPatient: true,
  sendToPatientUsers: [],
  enablePatientRerouting: true,
  enableCourierNavigate: false,
  returnTo: window.location.origin,
  federated: false,
  enableMedHistory: false,
  enableRxAndOrder: false,
  enableCombineAndDuplicate: true,
  topRankedCostco: false,
  topRankedWalgreens: false,
  hideTemplates: false
};

export const boson = function (organizationId: string | undefined) {
  if (organizationId && organizationSettings[organizationId]) {
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
  // Test Telehealth (us)
  org_KzSVZBQixLRkqj5d: {
    ...defaultSettings,
    accentColor: '#b35724',
    enableRxAndOrder: true,
    enableMedHistory: true,
    topRankedCostco: true,
    topRankedWalgreens: true,
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID],
    enableCourierNavigate: true
  },
  // NewCo (demo's)
  org_w85CgjUjCi52yvOz: {
    ...defaultSettings,
    logo: 'newco_logo.svg',
    accentColor: '#506ef5',
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID]
  },
  // test2
  org_zjqxDJzBNyuN9qcm: {
    ...defaultSettings,
    accentColor: '#b35724',
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID],
    enableMedHistory: true,
    enableRxAndOrder: true
  }
};
