import type {
  ClinicalAppEventName,
  FieldCompletionSnapshot,
  PhotonEmbedAnalyticsEventInput
} from '@photonhealth/sdk';
import type { ApiObject } from '@rudderstack/analytics-js';

function flattenSnapshot(fields: FieldCompletionSnapshot): Record<string, boolean | null> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [
      `snap_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`,
      val.completed
    ])
  );
}

/**
 * Resolves a CustomEvent detail into a RudderStack event name + payload.
 * The `name` field IS the final event name — no mapping needed.
 */
export function trackAnalyticsEvent(
  detail: PhotonEmbedAnalyticsEventInput,
  track: (eventName: ClinicalAppEventName, payload: ApiObject) => void
) {
  const { name, ...rest } = detail;

  // Flatten field completion snapshots (CTA events)
  const payload = { ...rest } as Record<string, unknown>;
  if (payload.fields) {
    const snapshot = flattenSnapshot(payload.fields as FieldCompletionSnapshot);
    delete payload.fields;
    Object.assign(payload, snapshot);
  }

  track(name, payload as ApiObject);
}
