import { test } from '@playwright/test';

test('user can login and create a new prescription', async ({ page }) => {
  await page.goto('/prescriptions');

  await page.getByRole('link', { name: /Patients/ }).click();
  await page.getByRole('link', { name: /New Patient/ }).click();

  // todo: make inputs accessible
  // await page.getByLabel('First Name').fill('first_name_123');
  // await page.getByLabel('Last Name').fill('last_name_123');
});
