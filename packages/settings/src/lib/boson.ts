import { MailOrderPharmacyConfigs } from '../types';
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
  provider: [CUREXA_PHARMACY_ID, CAREPOINT_PHARMACY_ID, TRUEPILL_PHARMACY_ID, HONEYBEE_PHARMACY_ID],
  patient: []
};

export const boson = function (organizationId: string | undefined): MailOrderPharmacyConfigs {
  const orgConfig = organizationId ? orgMailOrders[organizationId] : undefined;
  return {
    provider: orgConfig?.provider ?? defaultSettings.provider,
    patient: orgConfig?.patient ?? defaultSettings.patient
  };
};

/**
 * Org-specific settings overrides
 */

const orgMailOrders: Record<string, Partial<MailOrderPharmacyConfigs>> = {
  // Test Telehealth (us)
  org_KzSVZBQixLRkqj5d: {
    patient: [AMAZON_PHARMACY_ID, COST_PLUS_PHARMACY_ID, WALMART_MAIL_ORDER_PHARMACY_ID]
  },
  // NewCo (demo's)
  org_w85CgjUjCi52yvOz: {
    patient: [AMAZON_PHARMACY_ID]
  },
  // test2
  org_zjqxDJzBNyuN9qcm: {
    patient: [AMAZON_PHARMACY_ID]
  }
};
