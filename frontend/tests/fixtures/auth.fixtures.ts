import { test as base, type Page } from '@playwright/test';
import {
  injectSession,
  DEFAULT_CANDIDATE,
  DEFAULT_EMPLOYER,
  DEFAULT_ADMIN,
  type UserSessionOptions,
} from '../helpers/auth';
import { setupAllApiMocks } from '../mocks';

export interface AuthFixtures {
  candidatePage: Page;
  employerPage: Page;
  adminPage: Page;
  createAuthenticatedPage: (options: UserSessionOptions) => Promise<Page>;
}

export const test = base.extend<AuthFixtures>({
  candidatePage: async ({ page, context }, use) => {
    await setupAllApiMocks(page);
    await injectSession(context, DEFAULT_CANDIDATE);
    await use(page);
  },

  employerPage: async ({ page, context }, use) => {
    await setupAllApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
    await use(page);
  },

  adminPage: async ({ page, context }, use) => {
    await setupAllApiMocks(page);
    await injectSession(context, DEFAULT_ADMIN);
    await use(page);
  },

  createAuthenticatedPage: async ({ browser }, use) => {
    const fn = async (options: UserSessionOptions) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await setupAllApiMocks(page);
      await injectSession(context, options);
      return page;
    };
    await use(fn);
  },
});

export { expect } from '@playwright/test';
