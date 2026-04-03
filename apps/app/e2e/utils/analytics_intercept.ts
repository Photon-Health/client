import { Page } from '@playwright/test';

type CapturedEvent = { event: string; properties: Record<string, unknown> };

const capturedByPage = new WeakMap<Page, CapturedEvent[]>();

function extractEvents(body: any): CapturedEvent[] {
  const events: CapturedEvent[] = [];
  // Batched format: { batch: [{ type, event, properties }, ...] }
  if (Array.isArray(body?.batch)) {
    for (const item of body.batch) {
      if (item.type === 'track' && item.event) {
        events.push({ event: item.event, properties: item.properties ?? {} });
      }
    }
  }
  // Single event format: { type: "track", event, properties }
  else if (body?.type === 'track' && body?.event) {
    events.push({ event: body.event, properties: body.properties ?? {} });
  }
  return events;
}

/**
 * Intercepts RudderStack network requests via Playwright's route API.
 * Extracts track events from the request payload and stores them for assertions.
 * Must be called before page.goto().
 */
export async function setupAnalyticsCapture(page: Page) {
  const captured: CapturedEvent[] = [];
  capturedByPage.set(page, captured);

  await page.route(/dataplane\.rudderstack\.com/, (route) => {
    try {
      const body = route.request().postDataJSON();
      captured.push(...extractEvents(body));
    } catch {
      // non-JSON request (e.g. OPTIONS, GET for SDK loading) — ignore
    }
    route.fulfill({ status: 200, body: '{}' });
  });
}

export async function getCapturedAnalytics(page: Page): Promise<CapturedEvent[]> {
  return capturedByPage.get(page) ?? [];
}
