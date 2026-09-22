import type { BrowserContext, Page } from '@playwright/test';

export type UserRole = 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';

export interface UserSessionOptions {
  id?: number;
  email?: string;
  fullName?: string;
  role?: UserRole;
  companyId?: number;
  companyName?: string;
  isOnboarded?: boolean;
}

export const DEFAULT_CANDIDATE: UserSessionOptions = {
  id: 101,
  email: 'candidate.e2e@infohr.vn',
  fullName: 'Nguyen Van Ung Vien',
  role: 'JOB_SEEKER',
  isOnboarded: true,
};

export const NON_ONBOARDED_CANDIDATE: UserSessionOptions = {
  id: 102,
  email: 'candidate.new@infohr.vn',
  fullName: 'Ung Vien Moi',
  role: 'JOB_SEEKER',
  isOnboarded: false,
};

export const DEFAULT_EMPLOYER: UserSessionOptions = {
  id: 202,
  email: 'employer.e2e@infohr.vn',
  fullName: 'Tran Thi Tuyen Dung',
  role: 'EMPLOYER',
  companyId: 10,
  companyName: 'Cong ty Co phan InfoHR Vietnam',
  isOnboarded: true,
};

export const NON_ONBOARDED_EMPLOYER: UserSessionOptions = {
  id: 203,
  email: 'employer.new@infohr.vn',
  fullName: 'NTD Moi',
  role: 'EMPLOYER',
  isOnboarded: false,
};

export const DEFAULT_ADMIN: UserSessionOptions = {
  id: 303,
  email: 'admin.e2e@infohr.vn',
  fullName: 'He Thong Quan Tri',
  role: 'ADMIN',
  isOnboarded: true,
};

/**
 * Injects access_token and refresh_token cookies into browser context
 */
export async function injectSession(
  context: BrowserContext,
  options: UserSessionOptions = DEFAULT_CANDIDATE,
  domain?: string
) {
  const token = `e2e-${options.role?.toLowerCase() || 'candidate'}-token`;
  const domains = new Set<string>(['localhost', '127.0.0.1']);
  if (domain) domains.add(domain);
  if (process.env.PLAYWRIGHT_BASE_URL) {
    try {
      domains.add(new URL(process.env.PLAYWRIGHT_BASE_URL).hostname);
    } catch {
      // ignore
    }
  }

  const cookies: { name: string; value: string; domain: string; path: string }[] = [];
  for (const d of domains) {
    cookies.push(
      {
        name: 'access_token',
        value: token,
        domain: d,
        path: '/',
      },
      {
        name: 'refresh_token',
        value: `refresh-${token}`,
        domain: d,
        path: '/',
      }
    );
  }
  await context.addCookies(cookies);
}

/**
 * Helper to perform login via form UI
 */
export async function submitLoginForm(
  page: Page,
  options: { email: string; password?: string }
) {
  const emailInput = page.locator('input[name="email"], input#email').first();
  const passwordInput = page.locator('input[name="password"], input#password').first();
  const submitButton = page.locator('button[type="submit"]').first();

  await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
  await emailInput.fill(options.email);

  if (options.password !== undefined) {
    await passwordInput.waitFor({ state: 'visible', timeout: 15_000 });
    await passwordInput.fill(options.password);
  }

  await submitButton.click();
}
