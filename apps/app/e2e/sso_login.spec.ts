import { expect, Page, test } from '@playwright/test';
import { captureNavigations } from './utils/auth_intercept';

test.use({ storageState: { cookies: [], origins: [] } });

test('SSO login flow and logout loop regression', async ({ page }) => {
  const CONNECTION_NAME = 'fakecustomer';

  // Phase 1: Fresh SSO login — verify connection param and no duplicate redirects
  const authorizeRequests = setupAuthorizeRequestCapture(page);

  await page.goto(`/sso?connection=${CONNECTION_NAME}&returnTo=/patients/new`);
  await page.waitForURL(/fakecustomer.*auth0/, { timeout: 30_000 });

  expectSingleLoginRedirect(authorizeRequests, CONNECTION_NAME);

  await page.getByLabel('Email address').fill(process.env.PLAYWRIGHT_E2E_SSO_ACCOUNT_USERNAME);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill(process.env.PLAYWRIGHT_E2E_SSO_ACCOUNT_PASSWORD);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expectLandingPageVisible(page);

  // Phase 2: Re-visit /sso while authenticated — verify loggedOut=1 breaks any login/logout loop
  const navigationUrls = captureNavigations(page);

  await page.goto('/sso?connection=fakecustomer');
  await page.waitForURL(/loggedOut=1/, { timeout: 30_000 });
  expect(page.url()).toContain(`connection=${CONNECTION_NAME}`);
  await expectPhotonHomePageVisible(page);

  expectSingleLogoutRedirect(navigationUrls, CONNECTION_NAME);
});

function setupAuthorizeRequestCapture(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/authorize') && !url.includes('prompt=none')) {
      urls.push(url);
    }
  });
  return urls;
}

function expectSingleLoginRedirect(authorizeRequests: string[], connection: string) {
  const matching = authorizeRequests.filter((url) => url.includes(`connection=${connection}`));
  expect(matching).toHaveLength(1);
}

function expectSingleLogoutRedirect(navigationUrls: string[], connection: string) {
  const matching = navigationUrls.filter(
    (url) => url.includes('loggedOut=1') && url.includes(`connection=${connection}`)
  );
  expect(matching).toHaveLength(1);
}

async function expectPhotonHomePageVisible(page: Page) {
  await expect(page.getByRole('heading', { name: 'Prescriptions' })).toBeVisible({
    timeout: 60_000
  });
}

async function expectLandingPageVisible(page: Page) {
  await expect(page.getByLabel('First name')).toBeVisible({
    timeout: 60_000
  });
}
