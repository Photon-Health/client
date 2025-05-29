import { MailOrderPharmacyConfigs } from '../types';
import {
  AMAZON_PHARMACY_ID,
  CAREPOINT_PHARMACY_ID,
  COST_PLUS_PHARMACY_ID,
  CUREXA_PHARMACY_ID,
  HONEYBEE_PHARMACY_ID,
  TRUEPILL_PHARMACY_ID,
  WELLS_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_CARE_FIRST_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_CATTLES_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_COMPREHENSIVE_CARE_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_COSMO_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_HOLLY_PARK_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_MEADOWS_PHARMACY_ID,
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
    provider: defaultSettings.provider.concat([WELLS_PHARMACY_ID]),
    patient: [AMAZON_PHARMACY_ID, COST_PLUS_PHARMACY_ID, WALMART_MAIL_ORDER_PHARMACY_ID]
  },
  // NewCo (demo's)
  org_w85CgjUjCi52yvOz: {
    patient: [AMAZON_PHARMACY_ID]
  },
  // test2
  org_zjqxDJzBNyuN9qcm: {
    patient: [AMAZON_PHARMACY_ID]
  },
  // TwentyEight Boson
  org_4ukJmtK1kahiwSjh: {
    provider: [
      TRUEPILL_PHARMACY_ID,
      CAREPOINT_PHARMACY_ID,
      HONEYBEE_PHARMACY_ID,
      TWENTYEIGHT_PARTNER_COMPREHENSIVE_CARE_PHARMACY_ID,
      TWENTYEIGHT_PARTNER_MEADOWS_PHARMACY_ID,
      TWENTYEIGHT_PARTNER_CATTLES_PHARMACY_ID,
      TWENTYEIGHT_PARTNER_CARE_FIRST_PHARMACY_ID,
      TWENTYEIGHT_PARTNER_COSMO_PHARMACY_ID,
      TWENTYEIGHT_PARTNER_HOLLY_PARK_PHARMACY_ID
    ]
  },
  // Remedy Test
  org_4aLQHXJ1XLuYfxe7: {
    provider: [WELLS_PHARMACY_ID]
  }
};
