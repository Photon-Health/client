export const FeatureFlags = {
  ChangePharmacyReasons: 'change_pharmacy_reasons',
  RemoveReviewYourRxPage: 'remove_review_your_rx_page'
} as const;

export type FlagKeys = (typeof FeatureFlags)[keyof typeof FeatureFlags];

export type FlagValues = {
  [FeatureFlags.ChangePharmacyReasons]: boolean;
  [FeatureFlags.RemoveReviewYourRxPage]: {
    skipReviewPage: boolean;
    showRxSummaryOnPharmacyPage: boolean;
  };
};

export const FEATURE_FLAG_DEFAULTS: FlagValues = {
  [FeatureFlags.ChangePharmacyReasons]: false,
  [FeatureFlags.RemoveReviewYourRxPage]: {
    skipReviewPage: false,
    showRxSummaryOnPharmacyPage: false
  }
};
