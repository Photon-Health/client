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

/**
 * This is a Patient-App-Wide Provider of a generic "PatientAnalytics" object,
 * We can use the provider as a dependency injector of the different PatientAnalytics instances
 * (Either NoOp or Rudder/MixPanel) into all the places we actually want to track data.
 *
 * The main thrust of putting this together was to encapsulate when and how we track our patient data.
 * The simplest example being, if we're showing a demo we shouldn't be tracking anything.
 * In the future this is an easy place to configure, change, or experiment with how and when we track
 * patient behavior.
 */
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
