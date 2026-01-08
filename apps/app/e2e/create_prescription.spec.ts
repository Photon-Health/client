import { expect, test } from '@playwright/test';

test('user can login and create patient', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /Patients/ }).click();
  await page.getByRole('link', { name: /Create patient/ }).click();

  const patientNumber = getRandomInt(0, 100_000_000);

  await page.getByLabel('First name').fill('Jimbob');
  await page.getByLabel('Last name').fill(`McTesterson_${patientNumber}`);
  await page.getByLabel('Date of birth').fill('1980-12-31');
  await page.getByLabel('Mobile number').fill('8886543210');
  await page.getByLabel('Sex at birth').click();
  await page.getByRole('menuitem', { name: 'Male', exact: true }).click();
  await page.getByLabel('Street 1').fill('1 E2E Test St.');
  await page.getByLabel('City').fill('e2e-test-city');
  await page.getByLabel('State').click();
  await page.getByRole('menuitem', { name: 'AL', exact: true }).click();
  await page.getByLabel('Zip code').fill('12345');

  await page.getByRole('button', { name: 'Create', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Patients' })).toBeVisible();
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
