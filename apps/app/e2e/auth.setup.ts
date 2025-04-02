import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  console.log('=====> hello ');
  // Perform authentication steps. Replace these actions with your own.
  // await page.goto('https://github.com/login');
  // await page.getByLabel('Username or email address').fill('username');
  // await page.getByLabel('Password').fill('password');
  // await page.getByRole('button', { name: 'Sign in' }).click();

  await page.goto(`/`);
  await expect(page).toHaveTitle(/Photon/);
  await page.getByRole('button', { name: 'Log in' }).click();
  console.log(page.url());
  await expect(page.getByText('Log in to continue to Photon Clinical App')).toBeVisible();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  console.log('At google sso page.');
  await page.getByLabel('Email or phone').fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_USERNAME);
  console.log('Entered email.');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Enter your password').fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_PASSWORD);
  console.log('Entered password.');
  await page.getByRole('button', { name: 'Next' }).click();

  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL(process.env.PLAYWRIGHT_BASE_URL);

  await expect(page.getByRole('heading', { name: 'Prescriptions' })).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
