import { test, expect } from '@playwright/test';

test('user can login and create a new prescription', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Photon/);

  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Log in to continue to Photon Clinical App')).toBeVisible();
  await page.getByRole('button', { name: 'Continue with Google' }).click();

  await page.waitForURL(/accounts\.google\.com/, { timeout: 10_000 });

  await page.getByLabel('Email or phone').fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_USERNAME);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Enter your password').fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_PASSWORD);
  await page.getByRole('button', { name: 'Next' }).click();

  await page.waitForURL(/localhost/, { timeout: 20_000 });

  await page.getByRole('link', { name: /New Prescription/ }).click();
});
