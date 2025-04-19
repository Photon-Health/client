import { MailOrderPharmacyConfigs, OrganizationSettings } from '../types';
import {
  CUREXA_PHARMACY_ID,
  CAREPOINT_PHARMACY_ID,
  AMAZON_PHARMACY_ID,
  TRUEPILL_PHARMACY_ID,
  HONEYBEE_PHARMACY_ID,
  COST_PLUS_PHARMACY_ID,
  WALMART_MAIL_ORDER_PHARMACY_ID
} from '../pharmacies';

/**
 * All orgs inherit from default settings, so updates
 * to default settings can affect multiple orgs
 */

const defaultSettings = {
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
  enablePricing: false,
  topRankedCostco: false,
  topRankedWalgreens: false,
  hideTemplates: false
};

export const boson = function (organizationId: string | undefined): MailOrderPharmacyConfigs {
  const orgConfig = organizationId ? organizationSettings[organizationId] : undefined;
  return {
    provider: orgConfig?.mailOrderProviders ?? defaultSettings.mailOrderProviders,
    patient: orgConfig?.mailOrderNavigateProviders ?? defaultSettings.mailOrderNavigateProviders
  };
};

/**
 * Org-specific settings overrides
 */

const organizationSettings: {
  [key: string]: OrganizationSettings;
} = {
  // Test Telehealth (us)
  org_KzSVZBQixLRkqj5d: {
    accentColor: '#b35724',
    enableRxAndOrder: true,
    enableMedHistory: true,
    topRankedCostco: true,
    topRankedWalgreens: true,
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [
      AMAZON_PHARMACY_ID,
      COST_PLUS_PHARMACY_ID,
      WALMART_MAIL_ORDER_PHARMACY_ID
    ],
    enableCourierNavigate: true,
    enablePricing: true,
    paExceptionMessage:
      'Your insurance needs additional information from your provider before it will cover your prescription. Use the messaging feature in your Sesame profile to ask your provider to submit a prior authorization. If you’re paying cash, disregard and work with your pharmacy directly to pay the out-of-pocket price.'
  },
  // NewCo (demo's)
  org_w85CgjUjCi52yvOz: {
    logo: 'newco_logo.svg',
    accentColor: '#506ef5',
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID]
  },
  // test2
  org_zjqxDJzBNyuN9qcm: {
    accentColor: '#b35724',
    mailOrderNavigate: true,
    mailOrderNavigateProviders: [AMAZON_PHARMACY_ID],
    enableMedHistory: true,
    enableRxAndOrder: true
  }
};
