export type FlagValues = {
  select_org_invites: boolean;
};

export type FlagKeys = keyof FlagValues;

export const FEATURE_FLAG_DEFAULTS: FlagValues = {
  select_org_invites: false
};
