import { defineConfig, devices } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json'
      },
      dependencies: ['setup'],
      testIgnore: /sso_/
    },
    {
      // SSO tests use a fresh context and authenticate as part of the test flow,
      // so no setup project or stored auth state is needed.
      name: 'sso',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /sso_.*\.spec\.ts/
    }
  ],
  ...localDevServer()
});

function localDevServer(): { webServer: ReturnType<typeof defineConfig>['webServer'] } | {} {
  if (!baseUrl.includes('localhost')) return {};
  // for local dev, start (or re-use if running) the already running app
  return {
    webServer: {
      command: 'nx start',
      url: baseUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000
    }
  };
}
