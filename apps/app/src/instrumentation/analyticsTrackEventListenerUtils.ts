import type {
  ClinicalAppEventName,
  FieldCompletionSnapshot,
  PhotonEmbedAnalyticsEventInput
} from '@photonhealth/sdk';
import type { ApiObject } from '@rudderstack/analytics-js';

function flattenSnapshot(
  fields: FieldCompletionSnapshot | undefined
): Record<string, boolean | null> {
  if (!fields) return {};
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
  const { name, category: _category, ...rest } = detail;

  // Flatten field completion snapshots (CTA events)
  const payload = { ...rest } as Record<string, unknown>;
  if ('fields' in payload && payload.fields) {
    const snapshot = flattenSnapshot(payload.fields as FieldCompletionSnapshot);
    delete payload.fields;
    Object.assign(payload, snapshot);
  }

  track(name, payload as ApiObject);
}
