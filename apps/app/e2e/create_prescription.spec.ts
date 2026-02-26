import { expect, test } from '@playwright/test';

test('user can create patient and add draft prescription', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /Patients/ }).click();
  await page.getByRole('link', { name: /Create patient/ }).click();

  const patientNumber = getRandomInt(0, 100_000_000);

  await page.getByLabel('First name').fill('Jimbob');
  await page.getByLabel('Last name').fill(`McTesterson_${patientNumber}`);
  await page.locator('input[type="date"]').fill('1980-12-31');
  await page.getByLabel('Mobile number').fill('8886543210');
  await page.getByLabel('Sex at birth').selectOption('MALE');
  await page.getByLabel('Street 1').fill('1 E2E Test St.');
  await page.getByLabel('City').fill('e2e-test-city');
  await page.getByLabel('State').selectOption('AL');
  await page.getByLabel('Zip code').fill('12345');

  await page.getByRole('button', { name: 'Create and start prescription' }).click();

  await page.waitForURL(/\/prescriptions\/new\?patientId=/);

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
  await page.getByLabel('Patient Instructions (SIG)').fill('test-instructions-text');

  await page.getByRole('button', { name: 'Add to drafts' }).click();

  await expect(page.getByText('Draft Prescriptions')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Amoxicillin/i)).toBeVisible();

  // before uncommenting this and sending the order,
  // we need to decide what test patient phone number to use since currently text messages are sent
  // to the number.
  // await page.getByRole('button', { name: 'Send' }).click();
  // await page.waitForURL(/\/orders\/ord_/);
  // await expect(page.getByText(/Amoxicillin/i).first()).toBeVisible();
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
