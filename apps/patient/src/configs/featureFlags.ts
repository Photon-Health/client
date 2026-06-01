export type FlagValues = {
  remove_ready_by_selection_page: {
    skipReadyBySelectionPage: boolean;
  };
};

export type FlagKeys = keyof FlagValues;

export const FEATURE_FLAG_DEFAULTS: FlagValues = {
  remove_ready_by_selection_page: {
    skipReadyBySelectionPage: false
  }
};
