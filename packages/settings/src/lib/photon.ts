import { MailOrderPharmacyConfigs } from '../types';

import {
  CUREXA_PHARMACY_ID,
  CAREPOINT_PHARMACY_ID,
  AMAZON_PHARMACY_ID,
  TAILORMADE_PHARMACY_ID,
  REDBOX_PHARMACY_ID,
  GOGOMEDS_PHARMACY_ID,
  EMPOWER_PHARMACY_ID,
  AMBROSIA_PHARMACY_ID,
  WOMENS_INTERNATIONAL_PHARMACY_ID,
  REDROCK_SPRINGVILLE_PHARMACY_ID,
  REDROCK_STGEORGE_PHARMACY_ID,
  COST_PLUS_PHARMACY_ID,
  WALMART_MAIL_ORDER_PHARMACY_ID,
  STRIVE_PHARMACY_ID,
  HONEYBEE_PHARMACY_ID,
  TRUEPILL_PHARMACY_ID,
  HEALTHWAREHOUSE_PHARMACY_ID,
  OPENLOOP_PHARMACY_ID,
  GIFTHEALTH_PHARMACY_ID,
  DANIA_PHARMACY_ID,
  TRUEPILL_LILLY_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_COMPREHENSIVE_CARE_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_HOLLY_PARK_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_COSMO_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_CARE_FIRST_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_CATTLES_PHARMACY_ID,
  TWENTYEIGHT_PARTNER_MEADOWS_PHARMACY_ID
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
export const photon = function (organizationId: string | undefined): MailOrderPharmacyConfigs {
  const orgConfig = organizationId ? organizationSettings[organizationId] : undefined;
  return {
    provider: orgConfig?.provider ?? defaultSettings.provider,
    patient: orgConfig?.patient ?? defaultSettings.patient
  };
};

/**
 * Org-specific settings overrides
 */

const organizationSettings: {
  [key: string]: Partial<MailOrderPharmacyConfigs>;
} = {
  // Photon Test Account
  org_xqL46CdX49O1K5Ye: {
    provider: [
      REDROCK_SPRINGVILLE_PHARMACY_ID,
      REDROCK_STGEORGE_PHARMACY_ID,
      STRIVE_PHARMACY_ID,
      OPENLOOP_PHARMACY_ID,
      GIFTHEALTH_PHARMACY_ID
    ]
  },
  // River Health
  org_jScrLol7ZMSfExSR: {
    provider: [CAREPOINT_PHARMACY_ID]
  },
  // Peachy
  org_vTC7G2EAuHgac90E: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // MisterRx
  org_Frco5TQQFDHqS7xY: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Shapiro Medical (Xyon Health)
  org_Y0EPcd3p5eqG4iZs: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Osei Tutu (Xyon Health)
  org_WeSplxuyqxdIph1f: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Fadeyi Derm (Xyon Health)
  org_sWEo459pSKLt6wZ5: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Precision Medical Hair Restoration & Aesthetics (Xyon Health)
  org_G52mrmIBC3yqeNYB: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Gabel Center (Xyon Health)
  org_CFRRTHpFWmTjUjdP: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // California Hair Surgeon (Xyon Health)
  org_XWFD5B6e8qhCxXfN: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Anderson HSC (Xyon Health)
  org_mFPQdGzFZibbkFd7: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Feller and Bloxham Medical (Xyon Health)
  org_PJ0QDOdamRxfmr9g: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Premier Hair Solutions (Xyon Health)
  org_Sya74Xddjlm4cpf7: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Cooley Hair Center (Xyon Health)
  org_7a9qctA33YSc62vI: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Hair 4 Life Az (Xyon Health)
  org_fhJeej4u6rAoCWXq: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // DJL Physician Services (Xyon Health)
  org_7BeVTuZtlwXtRetc: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Hair Restoration Center of Connecticut - (Xyon Health)
  org_ArouZbOiqsGkyVsh: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Mass Derm Hair Transplant - (Xyon Health)
  org_xAvSD8db2dZDijSE: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Ognomy
  org_2B1yxV6yS9ROqV1g: {
    provider: [GIFTHEALTH_PHARMACY_ID, TRUEPILL_LILLY_PHARMACY_ID, AMAZON_PHARMACY_ID]
  },
  // Sana Care
  org_boRh5PcUzFhvyiue: {
    patient: [AMAZON_PHARMACY_ID, COST_PLUS_PHARMACY_ID, WALMART_MAIL_ORDER_PHARMACY_ID]
  },
  // Moment Health
  org_fdq7ceDPlQlO5e3J: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Found
  org_wM4wI7rop0W1eNfM: {
    provider: [STRIVE_PHARMACY_ID, GIFTHEALTH_PHARMACY_ID]
  },
  // DrTelx
  org_6DKb7celAunAoLzb: {
    provider: [
      TAILORMADE_PHARMACY_ID,
      GOGOMEDS_PHARMACY_ID,
      EMPOWER_PHARMACY_ID,
      AMBROSIA_PHARMACY_ID,
      WOMENS_INTERNATIONAL_PHARMACY_ID,
      STRIVE_PHARMACY_ID
    ]
  },
  // Redbox Rx
  org_fPIzyQJhFqvBAhJG: {
    provider: [REDBOX_PHARMACY_ID]
  },
  // Great Many
  org_gvTsxeeYy97qedaS: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Measured
  org_pcPnPx5PVamzjS2p: {
    provider: [
      REDROCK_SPRINGVILLE_PHARMACY_ID,
      REDROCK_STGEORGE_PHARMACY_ID,
      EMPOWER_PHARMACY_ID,
      GIFTHEALTH_PHARMACY_ID,
      STRIVE_PHARMACY_ID
    ]
  },
  // Bridge Dermatology (sub-org of Miiskin)
  org_YkpjWxuCmZsaWY1i: {
    provider: [CAREPOINT_PHARMACY_ID, HONEYBEE_PHARMACY_ID, TRUEPILL_PHARMACY_ID]
  },
  // Fifty 410
  org_BxZUVSH1m7cQVy1x: {
    provider: [HEALTHWAREHOUSE_PHARMACY_ID, EMPOWER_PHARMACY_ID]
  },
  // Unger Medical (Xyon Health)
  org_QeB1jtZVEvybXaO1: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Kopelman Hair (Xyon Health)
  org_HGmpRAOzaWsBOnXG: {
    provider: [CUREXA_PHARMACY_ID]
  },
  // Om Dermatology (sub-org of Miiskin)
  org_1eNnu0Wi14vBH7IM: {
    provider: [HONEYBEE_PHARMACY_ID]
  },
  // Geviti -- Sub org of CareTalk
  org_Zdri0JlNxJfWjzpk: {
    provider: [STRIVE_PHARMACY_ID]
  },
  // EveryMeds -- Sub org of CareTalk
  org_sDXma6gDyEQDQK0o: {
    provider: [DANIA_PHARMACY_ID]
  },
  // Precision Telemed
  org_zlsgaZsKLpFrkpyK: {
    provider: [EMPOWER_PHARMACY_ID]
  },
  // Twentyeight Health
  org_kFZU0twVQTOm5IPF: {
    patient: [
      AMAZON_PHARMACY_ID,
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
  }
};
