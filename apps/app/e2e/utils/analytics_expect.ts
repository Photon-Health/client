import { expect, Page } from '@playwright/test';
import { getCapturedAnalytics } from './analytics_intercept';

/**
 * Asserts that a specific field has the expected number of prescription_field_interaction events.
 */
export async function expectFieldInteraction(
  page: Page,
  eventName: string,
  fieldName: string,
  expectedCount: number
) {
  await expect(async () => {
    const all = await findByTrackEventType(page, eventName, 'prescription_field_interaction');
    const matches = all.filter((e) => e.properties.fieldName === fieldName);
    expect(matches.length).toBe(expectedCount);
  }).toPass({ timeout: 10_000 });
}

/**
 * Waits for a tracked event to appear with the expected count, then returns matching events.
 */
export async function expectTrackEventCount(
  page: Page,
  eventName: string,
  trackEventType: string,
  expectedCount: number
) {
  await expect(async () => {
    const events = await findByTrackEventType(page, eventName, trackEventType);
    expect(events.length).toBe(expectedCount);
  }).toPass({ timeout: 10_000 });

  return await findByTrackEventType(page, eventName, trackEventType);
}

/**
 * Asserts expected properties on a tracked event at a specific index.
 */
export async function expectTrackEventProperties(
  page: Page,
  eventName: string,
  trackEventType: string,
  options?: { index?: number; expectedProperties?: Record<string, unknown> }
) {
  const { index = 0, expectedProperties } = options ?? {};
  const events = await findByTrackEventType(page, eventName, trackEventType);
  expect(events.length).toBeGreaterThan(index);
  if (expectedProperties) {
    expect(events[index].properties).toEqual(expect.objectContaining(expectedProperties));
  }
  return events[index];
}

export async function findByTrackEventType(page: Page, eventName: string, trackEventType: string) {
  const all = await getCapturedAnalytics(page);
  return all.filter((e) => e.event === eventName && e.properties.trackEventType === trackEventType);
}
