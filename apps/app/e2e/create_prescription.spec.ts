import { expect, test } from '@playwright/test';
import { setupAnalyticsCapture } from './utils/analytics_intercept';
import {
  expectCtaCount,
  expectEventCount,
  expectEventProperties,
  expectFieldInteraction,
  findByEventName
} from './utils/analytics_expect';

test('user can create patient then add, edit, and delete a draft prescription', async ({
  page
}) => {
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

  await page.getByRole('button', { name: 'Create and start prescription' }).click();

  await page.waitForURL(/\/prescriptions\/new\?patientId=/);

  const medSearchInput = page.getByPlaceholder('Type medication');
  await expect(medSearchInput).toBeVisible({ timeout: 30_000 });

  const patientPageViewEvents = await findByEventName(page, 'New Patient Page Viewed');
  expect(patientPageViewEvents.length).toBeGreaterThan(0);
  const orderWorkflowId = patientPageViewEvents[0].properties.orderWorkflowId;
  expect(orderWorkflowId).toBeTruthy();

  await expectEventCount(page, 'New Prescriptions Page Viewed', 1);
  const openedEvent = await expectEventProperties(page, 'New Prescriptions Page Viewed', {
    expectedProperties: {
      weightUnit: 'lbs',
      hasPrefillWeight: false,
      hasPrefillPrescriptionIds: false,
      hasPrefillTemplateIds: false
    }
  });
  expect(openedEvent.properties.prefillPatientId).toBeTruthy();

  // Same orderWorkflowId should carry over from patient form to prescription form
  expect(openedEvent.properties.orderWorkflowId).toBe(orderWorkflowId);

  // add draft
  await medSearchInput.fill('Amoxicillin');
  const amoxicillinOption = page
    .locator('sl-menu-item')
    .filter({ hasText: /Amoxicillin/i })
    .first();
  await expect(amoxicillinOption).toBeVisible({ timeout: 10_000 });
  await amoxicillinOption.click();
  await page.getByLabel('Quantity').fill('30');
  await page.getByLabel('Quantity').blur();
  await page.getByLabel('Dispense Unit').selectOption('Capsule');
  await page.getByLabel('Days Supply').fill('10');
  await page.getByLabel('Days Supply').blur();
  await page.getByLabel('Refills').fill('0');
  await page.getByLabel('Refills').blur();
  await page.getByLabel('Patient Instructions (SIG)').fill('test-instructions-text');
  await page.getByLabel('Patient Instructions (SIG)').blur();
  await expectFieldInteraction(page, 'treatment', 1);
  await expectFieldInteraction(page, 'dispenseQuantity', 1);
  await expectFieldInteraction(page, 'daysSupply', 1);
  await expectFieldInteraction(page, 'refills', 1);
  await expectFieldInteraction(page, 'instructions', 1);
  await page.getByRole('button', { name: 'Add prescription' }).click();
  await expectCtaCount(page, 'Draft Prescription Added', 1);
  const draftAddedEvents = await findByEventName(page, 'Draft Prescription Added');
  const firstDraftAdded = draftAddedEvents[0];
  expect(firstDraftAdded?.properties).toEqual(
    expect.objectContaining({
      draftPrescriptionSource: 'form',
      snap_treatment: true,
      snap_dispense_unit: true,
      snap_dispense_quantity: true,
      snap_days_supply: true,
      snap_refills: true,
      snap_instructions: true,
      snap_notes: false,
      snap_do_not_fill_before_date: false,
      snap_add_to_templates: false
    })
  );
  await expect(page.getByText(/Amoxicillin/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /\+ Add another/i })).toBeVisible({
    timeout: 10_000
  });
  await expect(page.getByText(/30 Capsule, 0 Refills - test-instructions-text/i)).toBeVisible();

  // edit draft
  await page.getByTitle('Edit').click();
  await expectCtaCount(page, 'Draft Prescription Edited', 1);
  await expect(medSearchInput).toHaveValue(/Amoxicillin/i);
  await page.getByLabel('Quantity').fill('60');
  await page.getByRole('button', { name: 'Add prescription' }).click();
  await expectFieldInteraction(page, 'dispenseQuantity', 2);
  await expect(page.getByText(/60 Capsule, 0 Refills - test-instructions-text/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /\+ Add another/i })).toBeVisible({
    timeout: 10_000
  });
  await expect(page.getByText(/Amoxicillin/i)).toBeVisible();

  await expectCtaCount(page, 'Draft Prescription Added', 2);

  await page.getByRole('button', { name: 'Send' }).click();
  await page.waitForURL(/\/orders\/ord_/);
  await expect(page.getByText(/Amoxicillin/i).first()).toBeVisible();

  await expectEventCount(page, 'Order Sent', 1);
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
