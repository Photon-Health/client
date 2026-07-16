import { PhotonEmbedAnalyticsEventInput, AnalyticsContextQuery } from '@photonhealth/sdk';
import { createEffect, createSignal, JSXElement, onMount } from 'solid-js';
import { usePhotonClient } from '../systems/SDKProvider';
import { ApiObject } from '@rudderstack/analytics-js';

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

export const AnalyticsEventListener = (props: {
  clientRef: HTMLDivElement;
  children: JSXElement;
}) => {
  const client = usePhotonClient();
  const [contextData, setContextData] = createSignal<ProviderContextData | null>(null);

  onMount(async () => {
    // Fetch me + organization data via GraphQL
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
        // This should always be defined, need this check for type narrowing
        if (!context) {
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

        const properties: ApiObject = { ...context, ...payload };
        client.analytics.track({ event: name, userId: context.providerId, properties });
      }) as EventListener,
      listenerOptions
    );

    // TODO: do we need this?
    return () => abortController.abort();
  });

  return <>{props.children}</>;
};

// TODO: Copied this from client/apps/app/src/instrumentation/analyticsTrackEventListenerUtils.ts
// just to get things working, do this cleaner later
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
