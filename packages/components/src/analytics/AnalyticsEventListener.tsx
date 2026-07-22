import { PhotonEmbedAnalyticsEventInput, AnalyticsContextQuery } from '@photonhealth/sdk';
import { createEffect, createSignal, JSXElement } from 'solid-js';
import { usePhotonClient } from '../systems/SDKProvider';
import { ApiObject } from '@rudderstack/analytics-js';
import { usePhoton } from '../context';

interface ProviderContextData {
  // User info (from me query)
  providerId: string;
  providerEmail?: string;
  providerName?: string;
  providerNameFirst?: string;
  providerNameLast?: string;
  providerRoles?: string[];
  // Organization info
  orgId?: string;
  orgName?: string;
  // Customer info
  customerId?: string;
  customerName?: string;
}

interface FieldCompletionSnapshot {
  [fieldName: string]: { completed: boolean };
}

function flattenSnapshot(fields: FieldCompletionSnapshot): Record<string, boolean | null> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [
      `snap_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`,
      val.completed
    ])
  );
}

export const AnalyticsEventListener = (props: {
  clientRef: HTMLDivElement;
  /* Pass extra properties when photon-client is rendered in our web app */
  appAnalyticsProperties?: Record<string, unknown>;
  children: JSXElement;
}) => {
  const client = usePhotonClient();
  const [contextData, setContextData] = createSignal<ProviderContextData | null>(null);
  const store = usePhoton();

  createEffect(async () => {
    // In an embed-only setup, this component renders before the user is authenticated.
    // Only run the query once user is logged in.
    if (
      store.authentication.state.isAuthenticated &&
      !store.authentication.state.isLoading &&
      !contextData()
    ) {
      try {
        const { data } = await client.apolloClinical.query({ query: AnalyticsContextQuery });

        // Build context data from query response
        const contextData: ProviderContextData = {
          // User info from me query
          providerId: data.me.id,
          providerEmail: data.me.email || undefined,
          providerName: data.me.name?.full,
          providerNameFirst: data.me.name?.first,
          providerNameLast: data.me.name?.last,
          providerRoles: data.me.roles
            .map((role) => role.name)
            .filter((name): name is string => !!name),
          // Organization info
          orgId: data.organization?.id,
          orgName: data.organization?.name,
          // Customer info
          customerId: data.organization?.customer?.id,
          customerName: data.organization?.customer?.name
        };

        setContextData(contextData);
      } catch {
        // AnalyticsContextQuery should fail silently
        // There's also an edge case caused by the double-login scenario where
        // a rediret cancels the in-flight request, which is acceptable for now
      }
    }
  });

  createEffect(() => {
    const el = props.clientRef;
    if (!el) return;

    const abortController = new AbortController();
    const { signal: abortControllerSignal } = abortController;
    const listenerOptions = { signal: abortControllerSignal };

    el.addEventListener(
      'photon-analytics-track-event',
      ((e: CustomEvent<PhotonEmbedAnalyticsEventInput>) => {
        const context = contextData();
        if (!context) {
          console.warn(
            '📊 [Analytics: To Analytics API] Analytics context not defined, skipping tracking'
          );
          return;
        }

        const { name, ...rest } = e.detail;

        // Flatten field completion snapshots (CTA events)
        const payload = { ...rest } as Record<string, unknown>;
        if (payload.fields) {
          const snapshot = flattenSnapshot(payload.fields as FieldCompletionSnapshot);
          delete payload.fields;
          Object.assign(payload, snapshot);
        }

        const properties: ApiObject = {
          ...context,
          ...payload,
          ...props.appAnalyticsProperties
        };
        // Don't await this method, tracking analytics shouldn't block the JS thread
        client.analytics.track({ event: name, userId: context.providerId, properties });
      }) as EventListener,
      listenerOptions
    );

    return () => abortController.abort();
  });

  return <>{props.children}</>;
};
