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

// The context query usually resolves in less than a second, so we'll probably never
// reach this max. Can adjust as needed.
const MAX_QUEUED_EVENTS = 50;

export const AnalyticsEventListener = (props: {
  clientRef: HTMLDivElement;
  /* Pass extra properties when photon-client is rendered in our web app */
  appAnalyticsProperties?: Record<string, unknown>;
  children: JSXElement;
}) => {
  const client = usePhotonClient();
  const [contextData, setContextData] = createSignal<ProviderContextData | null>(null);
  const store = usePhoton();
  // This array doesn't need to be stored in a reactive signal since
  // nothing needs to subscribe to it - we just read it once contextData updates
  let queuedEvents: PhotonEmbedAnalyticsEventInput[] = [];

  const trackEvent = (detail: PhotonEmbedAnalyticsEventInput, context: ProviderContextData) => {
    const { name, ...rest } = detail;

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
  };

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
        // a redirect cancels the in-flight request, which is acceptable for now
      }
    }
  });

  // Send anything that was dispatched before the context query resolved
  createEffect(() => {
    const context = contextData();
    if (!context || queuedEvents.length === 0) return;

    const pending = queuedEvents;
    queuedEvents = [];
    pending.forEach((detail) => trackEvent(detail, context));
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
          // The max number of events should almost never be exceeded.
          // Re-evaluate analytics setup if we are constantly dropping events
          if (queuedEvents.length >= MAX_QUEUED_EVENTS) {
            console.warn(
              '📊 [Analytics: To Analytics API] Queue full while waiting for analytics context, dropping oldest event'
            );
            queuedEvents.shift();
          }
          queuedEvents.push(e.detail);
          return;
        }

        trackEvent(e.detail, context);
      }) as EventListener,
      listenerOptions
    );

    return () => abortController.abort();
  });

  return <>{props.children}</>;
};
