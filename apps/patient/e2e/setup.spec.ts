import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const testDataPath = path.join(__dirname, '.test-data.json');

test('create test patient and order via clinical app', async ({ page }) => {
  // 1. Log in via Auth0
  await page.goto('/login?connection=e2e-test-users');
  await expect(page).toHaveTitle(/Photon/);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Log in to continue to Photon Clinical App')).toBeVisible();
  await page.getByLabel('Username').fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_USERNAME!);
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill(process.env.PLAYWRIGHT_E2E_ACCOUNT_PASSWORD!);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForURL('**/prescriptions', { timeout: 60_000 });
  await expect(page.getByRole('heading', { name: 'Prescriptions' })).toBeVisible();

  // 2. Create a patient
  await page.getByRole('link', { name: /Patients/ }).click();
  await page.getByRole('link', { name: /Create patient/ }).click();

  const patientNumber = Math.floor(Math.random() * 100_000_000);
  await page.getByLabel('First name').fill('E2E');
  await page.getByLabel('Last name').fill(`TestPatient_${patientNumber}`);
  await page.getByLabel('Date of birth').fill('1990-01-15');
  await page.getByLabel('Mobile number').fill(process.env.PLAYWRIGHT_E2E_PATIENT_PHONE!);
  await page.getByLabel('Sex at birth').selectOption('UNKNOWN');
  await page.getByLabel('Street 1').fill('106 N 7th St');
  await page.getByLabel('City').fill('Brooklyn');
  await page.getByLabel('State').selectOption('NY');
  await page.getByLabel('Zip code').fill('11249');

  await page.getByRole('button', { name: 'Create and start prescription' }).click();
  await page.waitForURL(/\/prescriptions\/new\?patientId=/);

  // 3. Add a prescription
  const medSearchInput = page.getByPlaceholder('Type medication');
  await expect(medSearchInput).toBeVisible({ timeout: 30_000 });

  await medSearchInput.fill('Amoxicillin');
  const amoxicillinOption = page
    .locator('sl-menu-item')
    .filter({ hasText: /Amoxicillin/i })
    .first();
  await expect(amoxicillinOption).toBeVisible({ timeout: 10_000 });
  await amoxicillinOption.click();

  await page.getByLabel('Quantity').fill('30');
  await page.getByLabel('Dispense Unit').selectOption('Capsule');
  await page.getByLabel('Days Supply').fill('10');
  await page.getByLabel('Refills').fill('0');
  await page.getByLabel('Patient Instructions (SIG)').fill('e2e test notes sig');

  await page.getByRole('button', { name: 'Add to drafts' }).click();
  await expect(page.getByText('Draft Prescriptions')).toBeVisible({ timeout: 10_000 });

  // 4. Send the order
  await page.getByRole('button', { name: 'Send' }).click();
  await page.waitForURL(/\/orders\/ord_/, { timeout: 30_000 });

  // 5. Extract orderId from URL
  const url = page.url();
  const orderId = url.match(/\/orders\/(ord_[^/?]+)/)?.[1];
  expect(orderId).toBeTruthy();

  // 6. Write test data for patient app specs
  fs.writeFileSync(testDataPath, JSON.stringify({ orderId }, null, 2));
  console.log(`Test data written: orderId=${orderId}`);
});
