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

  await expect(page.getByRole('heading', { name: /choose a pharmacy/i })).toBeVisible({
    timeout: 15_000
  });

  const pharmacyListGroup = page.getByRole('radiogroup', { name: /select a pharmacy/i });
  const pharmacyCardToSelect = pharmacyListGroup.getByRole('radio').nth(1);
  const selectedPharmacyName = await pharmacyCardToSelect.getAttribute('aria-label');
  await pharmacyCardToSelect.click();
  await page.getByRole('button', { name: /select pharmacy/i }).click();

  await expect(page.getByText(/Order placed/i)).toBeVisible();
  await expect(page.getByText(selectedPharmacyName)).toBeVisible();
  await expect(page.getByText(/Amoxicillin/i)).toBeVisible();
});

type LandingPageNames = 'pharmacy-select' | 'order-placed';
async function getLandingPage(page: Page): Promise<LandingPageNames> {
  await expect(page.locator('body')).not.toContainText('Loading', { timeout: 15_000 });

  return Promise.race([
    page
      .getByRole('heading', { name: /choose a pharmacy/i })
      .waitFor({ timeout: 15_000 })
      .then(() => 'pharmacy-select' as const),
    page
      .getByText(/Order placed/i)
      .waitFor({ timeout: 15_000 })
      .then(() => 'order-placed' as const)
  ]);
}

function getTestData() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '.test-data.json'), 'utf-8'));
}
