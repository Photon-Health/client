import { expect, Page, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const testDataPath = path.join(__dirname, '.test-data.json');

test('create test patient and order via clinical app', async ({ page }) => {
  await loginViaAuth0(page);
  await createPatientAndStartPrescription(page);
  await createDraftPrescription(page, 'Amoxicillin');
  await clickSendOrder(page);

  // Extract orderId from order details page URL
  const url = page.url();
  const orderId = url.match(/\/orders\/(ord_[^/?]+)/)?.[1];
  expect(orderId).toBeTruthy();

  // Write to testDataPath, so patient app specs can load this fresh order
  fs.writeFileSync(testDataPath, JSON.stringify({ orderId }, null, 2));
  console.log(`Test data written: orderId=${orderId}`);
});

async function loginViaAuth0(page: Page) {
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
}

async function createPatientAndStartPrescription(page: Page) {
  await page.getByRole('link', { name: /Patients/ }).click();
  await page.getByRole('link', { name: /Create patient/ }).click();

  const patientNumber = Math.floor(Math.random() * 100_000_000);
  await page.getByLabel('First name').fill('patient-e2e-firstname');
  await page.getByLabel('Last name').fill(`patient-e2e-lastname-${patientNumber}`);
  await page.getByLabel('Date of birth').fill('1990-01-15');
  await page.getByLabel('Mobile number').fill(process.env.PLAYWRIGHT_E2E_PATIENT_PHONE!);
  await page.getByLabel('Sex at birth').selectOption('UNKNOWN');
  await page.getByLabel('Street 1').fill('106 N 7th St');
  await page.getByLabel('City').fill('Brooklyn');
  await page.getByLabel('State').selectOption('NY');
  await page.getByLabel('Zip code').fill('11249');

  await page.getByRole('button', { name: 'Create and start prescription' }).click();
  await page.waitForURL(/\/prescriptions\/new\?patientId=/);
}

async function createDraftPrescription(page: Page, medicationName: string) {
  const medSearchInput = page.getByPlaceholder('Type medication');
  await expect(medSearchInput).toBeVisible({ timeout: 30_000 });

  await medSearchInput.fill(medicationName);
  const amoxicillinOption = page
    .locator('sl-menu-item')
    .filter({ hasText: medicationName })
    .first();
  await expect(amoxicillinOption).toBeVisible({ timeout: 10_000 });
  await amoxicillinOption.click();

  await page.getByLabel('Quantity').fill('30');
  await page.getByLabel('Dispense Unit').selectOption('Capsule');
  await page.getByLabel('Days Supply').fill('10');
  await page.getByLabel('Refills').fill('0');
  await page.getByLabel('Patient Instructions (SIG)').fill('e2e test notes sig');

  await page.getByRole('button', { name: 'Add prescription' }).click();
  await expect(page.getByRole('button', { name: /\+ Add another/i })).toBeVisible({
    timeout: 10_000
  });
}

async function clickSendOrder(page: Page) {
  await page.getByRole('button', { name: 'Send' }).click();
  await page.waitForURL(/\/orders\/ord_/, { timeout: 30_000 });
}
