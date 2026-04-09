export type FlagValues = {
  change_pharmacy_reasons: boolean;
  remove_review_your_rx_page: {
    skipReviewPage: boolean;
    showRxSummaryOnPharmacyPage: boolean;
  };
};

export type FlagKeys = keyof FlagValues;

export const FEATURE_FLAG_DEFAULTS: FlagValues = {
  change_pharmacy_reasons: false,
  remove_review_your_rx_page: {
    skipReviewPage: false,
    showRxSummaryOnPharmacyPage: false
  }
};
