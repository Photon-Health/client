import { defineConfig, devices } from '@playwright/test';

const patientBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';
const clinicalBaseUrl = process.env.PLAYWRIGHT_CLINICAL_BASE_URL ?? 'https://app.boson.health';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: patientBaseUrl,
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'setup-new-order',
      testMatch: /setup-new-order\.spec\.ts/,
      use: { baseURL: clinicalBaseUrl }
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup-new-order'],
      testIgnore: /setup-new-order\.spec\.ts/
    }
  ],
  ...localDevServer()
});

function localDevServer(): { webServer: ReturnType<typeof defineConfig>['webServer'] } | object {
  if (!patientBaseUrl.includes('localhost')) return {};
  return {
    webServer: {
      command: 'npx nx run patient:start',
      url: patientBaseUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000
    }
  };
}
