import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function getTestData() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '.test-data.json'), 'utf-8'));
}

test('displays order status for a freshly created order', async ({ page }) => {
  const { orderId } = getTestData();

  // In boson, the patient-api accepts orderId as the auth token
  await page.goto(`/?orderId=${orderId}&token=${orderId}`);

  // The Main component fetches the order and renders Status
  // Wait for the page to load past the loading spinner
  await expect(page.locator('body')).not.toContainText('Loading', { timeout: 15_000 });

  // The status page should show the order status header
  await expect(page.getByText(/review your prescription/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Amoxicillin Oral Capsule 250 MG/i)).toBeVisible();

  // Should show the pharmacy issue button
  await expect(page.getByRole('button', { name: /search for a pharmacy/i })).toBeVisible();
});
