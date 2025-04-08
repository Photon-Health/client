import { expect, test } from '@playwright/test';

test('user can login and create patient', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /Patients/ }).click();
  await page.getByRole('link', { name: /New Patient/ }).click();

  const patientNumber = getRandomInt(0, 100_000_000);

  await page.getByLabel('First Name').fill('Jimbob');
  await page.getByLabel('Last Name').fill(`McTesterson_${patientNumber}`);
  await page.getByLabel('Date of Birth').fill('1980-12-31');
  await page.getByLabel('Mobile Number').fill('8886543210');
  await page.getByLabel('Sex at Birth').click();
  await page.getByRole('menuitem', { name: 'MALE', exact: true }).click();

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Patients' })).toBeVisible();
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
