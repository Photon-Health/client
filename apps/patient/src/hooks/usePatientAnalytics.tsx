import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPatientAnalytics, PatientAnalytics } from '../configs/analytics';

interface PatientAnalyticsProviderProps {
  children: ReactNode;
}

interface PatientContextData {
  isDemo: boolean;
}

const PatientAnalyticsContext = createContext<PatientAnalytics | null>(null);

export const PatientAnalyticsProvider = ({ children }: PatientAnalyticsProviderProps) => {
  const [searchParams] = useSearchParams();

  const context: PatientContextData = useMemo(
    () => ({
      isDemo: !!searchParams.get('demo')
    }),
    [searchParams]
  );

  const value = useMemo(() => getPatientAnalytics({ noop: context.isDemo }), [context]);

  return (
    <PatientAnalyticsContext.Provider value={value}>{children}</PatientAnalyticsContext.Provider>
  );
};

export const usePatientAnalytics = (): PatientAnalytics => {
  const patientAnalytics = useContext(PatientAnalyticsContext);

  if (!patientAnalytics) {
    throw new Error('usePatientAnalytics must be used within a PatientAnalyticsProvider');
  }

  return patientAnalytics;
};
