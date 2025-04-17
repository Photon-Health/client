import { expect, test as setup } from '@playwright/test';
import * as path from 'path';

// eslint-disable-next-line no-undef
const authFile = path.join(__dirname, './.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto(`/`);
  await expect(page).toHaveTitle(/Photon/);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Log in to continue to Photon Clinical App')).toBeVisible();
  await page.getByLabel('Username').fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_USERNAME);
  await page.getByLabel('Password').fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_PASSWORD);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForURL(process.env.PLAYWRIGHT_BASE_URL, { timeout: 60_000 });
  await expect(page.getByRole('heading', { name: 'Prescriptions' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
