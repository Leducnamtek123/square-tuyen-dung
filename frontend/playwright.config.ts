import { defineConfig, devices } from '@playwright/test';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
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
    cwd: configDir,
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
