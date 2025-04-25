import { MailOrderPharmacyConfigs } from '../types';

import {
  CUREXA_PHARMACY_ID,
  CAREPOINT_PHARMACY_ID,
  AMAZON_PHARMACY_ID,
  TRUEPILL_PHARMACY_ID,
  HONEYBEE_PHARMACY_ID,
  EMPOWER_PHARMACY_ID,
  REDBOX_PHARMACY_ID,
  GOGOMEDS_PHARMACY_ID,
  TAILORMADE_PHARMACY_ID,
  AMBROSIA_PHARMACY_ID,
  WOMENS_INTERNATIONAL_PHARMACY_ID,
  REDROCK_SPRINGVILLE_PHARMACY_ID,
  FOOTHILLS_PHARMACY_ID,
  SMARTSCRIPTS_PHARMACY_ID,
  OLYMPIA_PHARMACY_ID,
  REDROCK_STGEORGE_PHARMACY_ID,
  COST_PLUS_PHARMACY_ID,
  WALMART_MAIL_ORDER_PHARMACY_ID,
  HEALTHWAREHOUSE_PHARMACY_ID,
  STRIVE_PHARMACY_ID,
  OPENLOOP_PHARMACY_ID,
  GIFTHEALTH_PHARMACY_ID,
  EPIQ_PHARMACY_ID,
  PHOTON_TEST_PHARMACY_ID,
  DANIA_PHARMACY_ID
} from '../pharmacies';

/**
 * All orgs inherit from default settings, so updates
 * to default settings can affect multiple orgs
 */

const defaultSettings = {
  provider: [],
  patient: []
};

/**
 * Org-specific settings overrides
 */

export const neutron = function (organizationId: string | undefined): MailOrderPharmacyConfigs {
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
  org_kVS7AP4iuItESdMA: {
    provider: [
      CUREXA_PHARMACY_ID,
      CAREPOINT_PHARMACY_ID,
      TRUEPILL_PHARMACY_ID,
      HONEYBEE_PHARMACY_ID,
      GOGOMEDS_PHARMACY_ID,
      REDROCK_SPRINGVILLE_PHARMACY_ID,
      FOOTHILLS_PHARMACY_ID,
      SMARTSCRIPTS_PHARMACY_ID,
      OLYMPIA_PHARMACY_ID,
      HEALTHWAREHOUSE_PHARMACY_ID,
      STRIVE_PHARMACY_ID,
      OPENLOOP_PHARMACY_ID,
      GIFTHEALTH_PHARMACY_ID,
      EMPOWER_PHARMACY_ID,
      PHOTON_TEST_PHARMACY_ID,
      DANIA_PHARMACY_ID
    ],
    patient: [AMAZON_PHARMACY_ID, COST_PLUS_PHARMACY_ID, WALMART_MAIL_ORDER_PHARMACY_ID]
  },
  // NewCo (demo's)
  org_YiUudCToTSrjOuow: {
    provider: [CAREPOINT_PHARMACY_ID],
    patient: [AMAZON_PHARMACY_ID]
  },
  // Demo (demo's)
  org_TY5GFYPIRo3xQGYM: {
    patient: [AMAZON_PHARMACY_ID]
  },
  // River Health
  org_U3ofDUVRsNTYt7d8: {
    provider: [CAREPOINT_PHARMACY_ID]
  },
  // Peachy
  org_O2SLIoyyVTNXG5nX: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // MisterRx
  org_BBTs0RfOHqjpOO92: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // DrTelx
  org_XwCIUzcnim5PfPJa: {
    provider: [
      TAILORMADE_PHARMACY_ID,
      GOGOMEDS_PHARMACY_ID,
      EMPOWER_PHARMACY_ID,
      AMBROSIA_PHARMACY_ID,
      WOMENS_INTERNATIONAL_PHARMACY_ID,
      STRIVE_PHARMACY_ID
    ]
  },
  // Emily's Test environment (us)
  org_KPfcKzFtfzD3ISxW: {
    provider: [HONEYBEE_PHARMACY_ID]
  },
  // Found
  org_PwzQxriG4OcMD0iq: {
    provider: [STRIVE_PHARMACY_ID]
  },
  // Sesame
  org_QFoulY6Ornx7dMdw: {
    provider: [FOOTHILLS_PHARMACY_ID],
    patient: [AMAZON_PHARMACY_ID]
  },
  // Pine Medical
  org_AJ6WSTbag7RCfi0N: {
    patient: [EMPOWER_PHARMACY_ID]
  },
  // Twentyeight Health
  org_tA6GiBBgGBZwnf4e: {
    patient: [AMAZON_PHARMACY_ID, TRUEPILL_PHARMACY_ID, CAREPOINT_PHARMACY_ID, HONEYBEE_PHARMACY_ID]
  },
  // Redbox Rx
  org_1orA5KZ4dOtDwVsC: {
    provider: [REDBOX_PHARMACY_ID]
  },
  // Lifeforce
  org_3QjCdlUhKYD3Y5Xd: {
    provider: [TAILORMADE_PHARMACY_ID, GOGOMEDS_PHARMACY_ID]
  },
  // Sana
  org_nWFRQpF5fK1Fd0Ap: {
    patient: [AMAZON_PHARMACY_ID]
  },
  // GoalMD
  org_4CKpLMduRVMHl2Ft: {
    provider: [HONEYBEE_PHARMACY_ID, TRUEPILL_PHARMACY_ID]
  },
  // Great Many
  org_3IVuVvEdKSStmAig: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Xyon Health
  org_t9KbrhuLYSeZaqLK: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Xyon Health 2 (for Eric Liu)
  org_Nic6tFhWwlsnCvjc: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Measured
  org_CsGKYnFZbMI3SY3X: {
    provider: [REDROCK_SPRINGVILLE_PHARMACY_ID, REDROCK_STGEORGE_PHARMACY_ID, EMPOWER_PHARMACY_ID]
  },
  // Berry Street
  org_utUz7i0OsFKN7m33: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Miiskin integration testing account
  org_VWgnbn3MVynEjoND: {
    provider: [CAREPOINT_PHARMACY_ID, HONEYBEE_PHARMACY_ID, TRUEPILL_PHARMACY_ID]
  },
  // Miiskin Sandbox test sub-org
  org_HyrPueFq0JFqQIuf: {
    provider: [CAREPOINT_PHARMACY_ID, HONEYBEE_PHARMACY_ID, TRUEPILL_PHARMACY_ID]
  },
  // Fifty 410
  org_DFsDnAmXkPrtsrih: {
    provider: [HEALTHWAREHOUSE_PHARMACY_ID, EMPOWER_PHARMACY_ID]
  },
  // Precision telemed
  org_wmy57WStnHIFXBAr: {
    provider: [EMPOWER_PHARMACY_ID]
  },
  // Remedymeds
  org_YNHdqbbgnRWrsS9I: {
    provider: [EPIQ_PHARMACY_ID]
  }
};
