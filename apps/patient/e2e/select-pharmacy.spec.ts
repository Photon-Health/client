import { expect, Page, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('displays order status for a freshly created order', async ({ page }) => {
  const { orderId } = getTestData();

  await page.goto(`/?orderId=${orderId}&token=${orderId}`);

  const landingPage = await getLandingPage(page);
  if (landingPage === 'order-placed') {
    // Orders placed on the same phone number are "merged" via a feature known in the create_order lambda
    // as "open order" combining. So most tests after the first run of the day will hit the "placed" page
    // todo: figure out how to avoid this for e2e tests - organization setting "enableOpenOrderMerges" probably?
    return;
  }

  await expect(page.getByText(/Amoxicillin Oral Capsule 250 MG/i)).toBeVisible();

  await page.getByRole('button', { name: /search for a pharmacy/i }).click();

  await expect(page.getByText(/select a pharmacy/i)).toBeVisible({ timeout: 15_000 });

  await page.getByText('Organic Planet Pharmacy').click();
  await page.getByRole('button', { name: /select pharmacy/i }).click();
  await page.getByText('Urgent').click();
  await page.getByRole('button', { name: /next/i }).click();

  await expect(page.getByText(/Order placed/i)).toBeVisible();
  await expect(page.getByText(/Organic Planet Pharmacy/i)).toBeVisible();
  await expect(page.getByText(/Amoxicillin/i)).toBeVisible();
});

type LandingPageNames = 'review-your-prescription' | 'order-placed';
async function getLandingPage(page: Page): Promise<LandingPageNames> {
  await expect(page.locator('body')).not.toContainText('Loading', { timeout: 15_000 });

  return Promise.race([
    page
      .getByText(/review your prescription/i)
      .waitFor({ timeout: 15_000 })
      .then(() => 'review-your-prescription' as const),
    page
      .getByText(/Order placed/i)
      .waitFor({ timeout: 15_000 })
      .then(() => 'order-placed' as const)
  ]);
}

function getTestData() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '.test-data.json'), 'utf-8'));
}
