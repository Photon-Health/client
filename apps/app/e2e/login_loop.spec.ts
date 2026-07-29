import { expect, test } from '@playwright/test';
import { captureAuthorizeNavigations } from './utils/auth_intercept';

/**
 * Regression coverage for the embedded-elements login loop, where users were
 * bounced through Auth0 indefinitely. Every redirect succeeded server-side
 * ("Success Silent Auth" + "Success Exchange" in the Auth0 logs), so the only
 * observable symptom is the client navigating to `/authorize` over and over.
 *
 * This spans apps/app, packages/elements, packages/components and packages/sdk:
 * <photon-client> lives in elements, its auth store in components, and the
 * session/token handling in the sdk. Unit tests on either side of those
 * boundaries mock each other, so only an E2E run proves the real composition
 * doesn't redirect.
 */

/** The session poll in photon-client-component runs on this interval. */
const SESSION_POLL_MS = 60_000;

test('an authenticated session does not redirect back to Auth0', async ({ page }) => {
  const authorizeNavigations = captureAuthorizeNavigations(page);

  await page.goto('/');

  // Auth actually worked, rather than nothing having loaded at all.
  await expect(page.getByRole('heading', { name: 'Prescriptions' })).toBeVisible({
    timeout: 60_000
  });

  // The stored session is valid, so photon-client should never navigate to Auth0.
  expect(authorizeNavigations).toHaveLength(0);

  // No auth error surfaced either — the circuit breaker renders one when it
  // refuses a login, and an unverifiable session renders one too.
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('the background session poll does not navigate the user to login', async ({ page }) => {
  // getAccessToken used to turn any silent-token failure into a full-page login
  // redirect, and this poll called it once a minute — so an idle user could be
  // yanked into a loop without touching anything. Crossing one poll boundary is
  // the only way to catch a regression there.
  test.setTimeout(SESSION_POLL_MS + 120_000);

  const authorizeNavigations = captureAuthorizeNavigations(page);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Prescriptions' })).toBeVisible({
    timeout: 60_000
  });

  await page.waitForTimeout(SESSION_POLL_MS + 5_000);

  expect(authorizeNavigations).toHaveLength(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
  // Still usable, not stuck behind an error state.
  await expect(page.getByRole('heading', { name: 'Prescriptions' })).toBeVisible();
});

test('the prescribe workflow loads without a further login redirect', async ({ page }) => {
  // The prescribe workflow is the element customers actually embed, and it
  // mounts its own auth-dependent children inside <photon-client>.
  const authorizeNavigations = captureAuthorizeNavigations(page);

  await page.goto('/patients');
  await page.getByRole('link', { name: /Create patient/ }).click();

  await expect(page.getByLabel('First name')).toBeVisible({ timeout: 60_000 });

  expect(authorizeNavigations).toHaveLength(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
