import { expect, test as setup } from '@playwright/test';
import * as path from 'path';

// eslint-disable-next-line no-undef
const authFile = path.join(__dirname, './.auth/user.json');

setup('authenticate', async ({ page }) => {
  // both boson and neutron have Auth0 connections named "e2e-test-users"
  await page.goto(`/login?connection=e2e-test-users`);
  await expect(page).toHaveTitle(/Photon/);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Log in to continue to Photon Clinical App')).toBeVisible();
  await page.getByLabel('Username').fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_USERNAME);
  const passwordInput = page.getByRole('textbox', { name: 'Password' });
  const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
  // Auth0 identifier-first login asks for the password on a second screen
  if (!(await passwordInput.isVisible())) {
    await continueButton.click();
  }
  await passwordInput.fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_PASSWORD);
  await continueButton.click();
  await page.waitForURL(process.env.PLAYWRIGHT_BASE_URL, { timeout: 180_000 });
  await expect(page.getByRole('heading', { name: 'Prescriptions' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
