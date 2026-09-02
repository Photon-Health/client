import { useEffect, useState } from 'react';

import { FEATURE_FLAG_DEFAULTS, FlagKeys } from '../configs/featureFlags';
import { getProviderAnalytics } from '../configs/providerAnalytics';

/**
 * Resolve a Mixpanel feature flag. `loading` is true until the flag lookup
 * settles; `enabled` is the flag's default from `FEATURE_FLAG_DEFAULTS`
 * until then.
 */
export function useFeatureFlag(flagName: FlagKeys) {
  const [state, setState] = useState({
    enabled: FEATURE_FLAG_DEFAULTS[flagName],
    loading: true
  });

  useEffect(() => {
    let cancelled = false;

    getProviderAnalytics()
      .isFeatureEnabled(flagName)
      .then((enabled) => {
        if (!cancelled) {
          setState({ enabled, loading: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ enabled: FEATURE_FLAG_DEFAULTS[flagName], loading: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [flagName]);

  return state;
}
