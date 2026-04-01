import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react';
import { gql, useQuery } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { usePhoton } from '@photonhealth/react';
import { ApiObject } from '@rudderstack/analytics-js';
import { type ClinicalAppEventName } from '@photonhealth/sdk';
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

interface ProviderAnalyticsContextValue {
  /**
   * Track a user event with automatic context injection
   */
  track: (eventName: ClinicalAppEventName, properties?: ApiObject) => void;

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
  const { pathname } = useLocation();

  // We need to skip the Analytics GQL call for Auth pages, because it will trigger
  // a race condition: packages/sdk/src/auth.ts `loginWithRedirect` vs the login/logout flow on the SSOLogin page
  const isAuthRoute = ['/sso', '/login', '/logout', '/signup'].includes(pathname);

  // useRef (not useState) so the ID is available synchronously on the first render —
  // some components fire form_opened analytics events during that initial render.
  const orderWorkflowIdRef = useRef<string | null>(null);

  const isOnOrderWorkflowRoute = isOrderWorkflowRoute(pathname);
  if (isOnOrderWorkflowRoute && !orderWorkflowIdRef.current) {
    orderWorkflowIdRef.current = crypto.randomUUID();
    console.log(`📊 [Analytics] Changed Order Workflow ID to ${orderWorkflowIdRef.current}`);
  } else if (!isOnOrderWorkflowRoute) {
    orderWorkflowIdRef.current = null;
    console.log(`📊 [Analytics] Changed Order Workflow ID to null`);
  }

  // Fetch me + organization data via GraphQL
  const { data, loading: queryLoading } = useQuery(ANALYTICS_CONTEXT_QUERY, {
    client: clinicalClient,
    skip: !isAuthenticated || isLoading || !clinicalClient || isAuthRoute
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

  const pageName = getPageName(pathname);

  // Wrapped track function that auto-includes context
  const track = useCallback(
    (eventName: string, properties: ApiObject = {}) => {
      const event: ApiObject = { ...contextData, pageName, ...properties };
      if (orderWorkflowIdRef.current) {
        event.orderWorkflowId = orderWorkflowIdRef.current;
      }
      getProviderAnalytics().track(eventName, event);
    },
    [contextData, pageName]
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

const PRESCRIBE_FLOW_ROUTES = [
  '/patients/new',
  '/patients/update/',
  '/prescriptions/new',
  '/orders/new',
  '/orders/ord_'
];

function isOrderWorkflowRoute(pathname: string): boolean {
  return PRESCRIBE_FLOW_ROUTES.some((route) => pathname.startsWith(route));
}

const PAGE_NAME_MAP: [string, string][] = [
  ['/patients/new', 'New Patient'],
  ['/patients/update/', 'Update Patient'],
  ['/prescriptions/new', 'New Prescriptions'],
  ['/orders/new', 'New Order'],
  ['/orders/ord_', 'Order Details']
];

function getPageName(pathname: string): string | undefined {
  const match = PAGE_NAME_MAP.find(([prefix]) => pathname.startsWith(prefix));
  return match?.[1];
}

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
