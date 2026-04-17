export type FlagValues = {
  remove_review_your_rx_page: {
    skipReviewPage: boolean;
    showRxSummaryOnPharmacyPage: boolean;
  };
};

export type FlagKeys = keyof FlagValues;

export const FEATURE_FLAG_DEFAULTS: FlagValues = {
  remove_review_your_rx_page: {
    skipReviewPage: false,
    showRxSummaryOnPharmacyPage: false
  }
};
