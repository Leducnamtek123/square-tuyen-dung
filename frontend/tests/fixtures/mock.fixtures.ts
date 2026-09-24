import { test as base } from '@playwright/test';
import { setupAllApiMocks } from '../mocks';

export const test = base.extend({
  page: async ({ page }, use) => {
    await setupAllApiMocks(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
