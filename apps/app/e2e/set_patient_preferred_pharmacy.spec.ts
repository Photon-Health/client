import { test } from '@playwright/test';
import { setupAnalyticsCapture } from './utils/analytics_intercept';
import { expectEventCount, expectEventProperties } from './utils/analytics_expect';

test('user can create patient with preferred pharmacy', async ({ page }) => {
  await setupAnalyticsCapture(page);

  await page.goto('/');

  await page.getByRole('link', { name: /Patients/ }).click();
  await page.getByRole('link', { name: /Create patient/ }).click();

  const patientNumber = getRandomInt(0, 100_000_000);

  await page.getByLabel('First name').fill('Jimbob');
  await page.getByLabel('Last name').fill(`McTesterson_${patientNumber}`);
  await page.getByLabel('Date of birth').fill('1980-12-31');
  await page.getByLabel('Mobile number').fill(process.env.PLAYWRIGHT_E2E_PATIENT_PHONE);
  await page.getByLabel('Sex at birth').selectOption('MALE');
  await page.getByLabel('Street 1').fill('1 E2E Test St.');
  await page.getByLabel('City').fill('e2e-test-city');
  await page.getByLabel('State').selectOption('AL');
  await page.getByLabel('Zip code').fill('12345');

  // select a preferred pharmacy
  await page.getByLabel('Set a location').click();
  await page.getByLabel('Enter an address or zip code').fill('11211');
  await page.getByRole('listbox').getByRole('option').first().click();
  await page.getByLabel('Enter an address or zip code').waitFor({ state: 'hidden' });
  await page.getByLabel('Show options').click();
  await page.getByRole('listbox').getByRole('option').first().click();
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  await page.waitForURL('/patients');
  await expectEventCount(page, 'New Patient Page Viewed', 1);
  await expectEventCount(page, 'Patient Created', 1);
  await expectEventProperties(page, 'Patient Created', {
    expectedProperties: {
      snap_preferred_pharmacy: true
    }
  });
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
