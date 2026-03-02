import { expect, test } from '@playwright/test';
import { RX_FORM_EVENT, setupAnalyticsCapture } from './utils/analytics_intercept';
import {
  expectTrackEventCount,
  expectTrackEventProperties,
  expectTrackFieldInteraction
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

  await expectTrackEventCount(page, RX_FORM_EVENT, 'prescription_form_opened', 1);
  const openedEvent = await expectTrackEventProperties(
    page,
    RX_FORM_EVENT,
    'prescription_form_opened',
    {
      expectedProperties: {
        weightUnit: 'lbs',
        hasPrefillWeight: false,
        hasPrefillPrescriptionIds: false,
        hasPrefillTemplateIds: false
      }
    }
  );
  expect(openedEvent.properties.prefillPatientId).toBeTruthy();

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
  await expectTrackFieldInteraction(page, RX_FORM_EVENT, 'treatment', 1);
  await expectTrackFieldInteraction(page, RX_FORM_EVENT, 'dispenseQuantity', 1);
  await expectTrackFieldInteraction(page, RX_FORM_EVENT, 'daysSupply', 1);
  await expectTrackFieldInteraction(page, RX_FORM_EVENT, 'refills', 1);
  await expectTrackFieldInteraction(page, RX_FORM_EVENT, 'instructions', 1);
  await page.getByRole('button', { name: 'Add to drafts' }).click();
  await expectTrackEventCount(page, RX_FORM_EVENT, 'draft_prescription_added', 1);
  await expectTrackEventProperties(page, RX_FORM_EVENT, 'draft_prescription_added', {
    expectedProperties: {
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
    }
  });
  await expect(page.getByText('Draft Prescriptions')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Amoxicillin/i)).toBeVisible();
  await expect(page.getByText(/30 Capsule, 0 Refills - test-instructions-text/i)).toBeVisible();

  // edit draft
  await page.getByTitle('Edit').click();
  await expectTrackEventCount(page, RX_FORM_EVENT, 'draft_prescription_edited', 1);
  await expect(medSearchInput).toHaveValue(/Amoxicillin/i);
  await page.getByLabel('Quantity').fill('60');
  await page.getByRole('button', { name: 'Add to drafts' }).click();
  await expectTrackFieldInteraction(page, RX_FORM_EVENT, 'dispenseQuantity', 2);
  await expect(page.getByText(/60 Capsule, 0 Refills - test-instructions-text/i)).toBeVisible();
  await expect(page.getByText('Draft Prescriptions')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Amoxicillin/i)).toBeVisible();

  await expectTrackEventCount(page, RX_FORM_EVENT, 'draft_prescription_added', 2);
  await expectTrackEventProperties(page, RX_FORM_EVENT, 'draft_prescription_added', {
    index: 1,
    expectedProperties: {
      draftPrescriptionSource: 'form',
      snap_treatment: true,
      snap_instructions: true
    }
  });

  // delete draft
  await page.getByTitle('Delete').click();
  await page.getByRole('button', { name: 'Yes, Delete' }).click();
  await expect(page.getByText(/Delete pending prescription/i)).not.toBeVisible({ timeout: 5_000 });
  await expect(page.getByText(/Add prescription\(s\) before sending/i)).toBeVisible();

  await expectTrackEventCount(page, RX_FORM_EVENT, 'draft_prescription_deleted', 1);

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
