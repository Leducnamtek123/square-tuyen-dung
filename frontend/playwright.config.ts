import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    /* Base URL is usually your local dev server */
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    /* Anthropic Best Practice: Wait for networkidle when doing visual tests */
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // You can test WebKit and Firefox separately if needed
  ],

  /* Run local dev server before starting tests, just like the with_server.py script */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
