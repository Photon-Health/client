import { useMemo } from 'react';
import { useProviderAnalytics } from './useProviderAnalytics';

export function useHighestUserRole() {
  const { contextData } = useProviderAnalytics();

  return useMemo(() => {
    if (!contextData.providerRoles) return;

    switch (true) {
      case contextData.providerRoles.includes('Administrator'):
        return 'ADMIN';
      case contextData.providerRoles.includes('Prescriber'):
        return 'PROVIDER';
      case contextData.providerRoles.includes('Medical Operations'):
        return 'MED_OPS';
      case contextData.providerRoles.includes('Staff'):
        return 'STAFF';
      case contextData.providerRoles.includes('Support'):
        return 'SUPPORT';
      case contextData.providerRoles.includes('Developer'):
        return 'DEVELOPER';
      default:
        return 'UNKNOWN';
    }
  }, [contextData.providerRoles]);
}
