import { expect, Page } from '@playwright/test';
import { getCapturedAnalytics } from './analytics_intercept';

/**
 * Finds all captured events matching the given RudderStack event name.
 */
export async function findByEventName(page: Page, eventName: string) {
  const all = await getCapturedAnalytics(page);
  return all.filter((e) => e.event === eventName);
}

/**
 * Asserts that a specific field has the expected number of Field Interaction events.
 */
export async function expectFieldInteraction(page: Page, fieldName: string, expectedCount: number) {
  await expect(async () => {
    const events = await findByEventName(page, 'Field Interaction');
    const matches = events.filter((e) => e.properties.fieldName === fieldName);
    expect(matches.length).toBe(expectedCount);
  }).toPass({ timeout: 10_000 });
}

/**
 * Waits for a tracked event to appear with the expected count, then returns matching events.
 */
export async function expectEventCount(page: Page, eventName: string, expectedCount: number) {
  await expect(async () => {
    const events = await findByEventName(page, eventName);
    expect(events.length).toBe(expectedCount);
  }).toPass({ timeout: 10_000 });

  return await findByEventName(page, eventName);
}

/**
 * Asserts expected properties on a tracked event at a specific index.
 */
export async function expectEventProperties(
  page: Page,
  eventName: string,
  options?: { index?: number; expectedProperties?: Record<string, unknown> }
) {
  const { index = 0, expectedProperties } = options ?? {};
  const events = await findByEventName(page, eventName);
  expect(events.length).toBeGreaterThan(index);
  if (expectedProperties) {
    expect(events[index].properties).toEqual(expect.objectContaining(expectedProperties));
  }
  return events[index];
}

/**
 * Asserts expected count of CTA events with a specific event name.
 */
export async function expectCtaCount(page: Page, ctaName: string, expectedCount: number) {
  await expectEventCount(page, ctaName, expectedCount);
}
