import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { ApiObject } from '@rudderstack/analytics-js';
import { getProviderAnalytics } from '../configs/providerAnalytics';
import { setInstrumentationUserContext } from '../instrumentation/setInstrumentationUserContext';

const ENVIRONMENT = import.meta.env.VITE_ENV_NAME || 'development';

const ANALYTICS_CONTEXT_QUERY = gql`
  query AnalyticsContextQuery {
    me {
      email
      id
      name {
        first
        full
        last
        middle
        title
      }
    }
    organization {
      customer {
        id
        name
      }
      name
      id
    }
  }
`;

export interface ProviderContextData {
  // Environment
  environment: string;
  // User info (from me query)
  providerId?: string;
  providerEmail?: string;
  providerName?: string;
  providerNameFirst?: string;
  providerNameLast?: string;
  // Organization info
  orgId?: string;
  orgName?: string;
  // Customer info
  customerId?: string;
  customerName?: string;
}

// these values map to table names, so please use clinicalapp as a prefix
type ClinicalAppTrackEventName =
  | 'clinicalapp_patient_form_track_events'
  | 'clinicalapp_signature_attestation_form_track_events'
  | 'clinicalapp_prescription_form_track_events'
  | 'clinicalapp_order_details_track_events';

interface ProviderAnalyticsContextValue {
  /**
   * Track a user event with automatic context injection
   */
  track: (eventName: ClinicalAppTrackEventName, properties?: ApiObject) => void;

  /**
   * Current provider context data (user, org info)
   */
  contextData: ProviderContextData;

  /**
   * Whether analytics is ready (user is authenticated and data loaded)
   */
  isReady: boolean;
}

const ProviderAnalyticsContext = createContext<ProviderAnalyticsContextValue | null>(null);

interface ProviderAnalyticsProviderProps {
  children: ReactNode;
}

export const ProviderAnalyticsProvider = ({ children }: ProviderAnalyticsProviderProps) => {
  const { isAuthenticated, isLoading, clinicalClient } = usePhoton();

  // Fetch me + organization data via GraphQL
  const { data, loading: queryLoading } = useQuery(ANALYTICS_CONTEXT_QUERY, {
    client: clinicalClient,
    skip: !isAuthenticated || isLoading || !clinicalClient
  });

  // Build context data from query response
  const contextData: ProviderContextData = useMemo(
    () => ({
      // Environment
      environment: ENVIRONMENT,
      // User info from me query
      providerId: data?.me?.id,
      providerEmail: data?.me?.email,
      providerName: data?.me?.name?.full,
      providerNameFirst: data?.me?.name?.first,
      providerNameLast: data?.me?.name?.last,
      // Organization info
      orgId: data?.organization?.id,
      orgName: data?.organization?.name,
      // Customer info
      customerId: data?.organization?.customer?.id,
      customerName: data?.organization?.customer?.name
    }),
    [data]
  );

  // Set Datadog instrumentation context when data is loaded
  useEffect(() => {
    if (data?.me && data?.organization) {
      setInstrumentationUserContext({
        org_id: data.organization.id,
        email: data.me.email,
        name: data.me.name?.full ?? '',
        customer_id: data.organization.customer?.id
      });
    }
  }, [data]);

  // Wrapped track function that auto-includes context
  const track = useCallback(
    (eventName: string, properties: ApiObject = {}) => {
      getProviderAnalytics().track(eventName, {
        ...contextData,
        ...properties
      });
    },
    [contextData]
  );

  const value: ProviderAnalyticsContextValue = useMemo(
    () => ({
      track,
      contextData,
      isReady: isAuthenticated && !isLoading && !queryLoading && !!data
    }),
    [track, contextData, isAuthenticated, isLoading, queryLoading, data]
  );

  return (
    <ProviderAnalyticsContext.Provider value={value}>{children}</ProviderAnalyticsContext.Provider>
  );
};

/**
 * Hook to access analytics tracking functions with automatic context injection.
 *
 * @example
 * ```tsx
 * const { track } = useProviderAnalytics();
 *
 * // Track a button click
 * const handleClick = () => {
 *   track('Button Clicked', { buttonName: 'Create Patient' });
 * };
 * ```
 */
export const useProviderAnalytics = (): ProviderAnalyticsContextValue => {
  const context = useContext(ProviderAnalyticsContext);

  if (!context) {
    throw new Error('useProviderAnalytics must be used within a ProviderAnalyticsProvider');
  }

  return context;
};
