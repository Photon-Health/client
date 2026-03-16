import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('displays order status for a freshly created order', async ({ page }) => {
  const { orderId } = getTestData();

  await page.goto(`/?orderId=${orderId}&token=${orderId}`);

  await expect(page.locator('body')).not.toContainText('Loading', { timeout: 15_000 });

  await expect(page.getByText(/review your prescription/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Amoxicillin Oral Capsule 250 MG/i)).toBeVisible();

  await expect(page.getByRole('button', { name: /search for a pharmacy/i })).toBeVisible();

  // next steps: click search button, choose a pharmacy, confirm order status page shows correct summary
});

function getTestData() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '.test-data.json'), 'utf-8'));
}
