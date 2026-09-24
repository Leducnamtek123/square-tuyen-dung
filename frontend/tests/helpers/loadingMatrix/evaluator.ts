import type { Page, Locator } from '@playwright/test';
import type { UXIssue, SeverityLevel } from './types';

/**
 * Common selectors for loading states in the application
 */
export const LOADING_SELECTORS = [
  '.MuiSkeleton-root',
  '[data-slot="skeleton"]',
  '.animate-pulse',
  '.MuiCircularProgress-root',
  '[role="progressbar"]',
  '.loading-spinner',
  '[aria-busy="true"]',
  '[data-testid="loading"]',
];

/**
 * Common selectors for empty states
 */
export const EMPTY_STATE_SELECTORS = [
  '[data-testid="empty-card"]',
  '[data-testid="no-data"]',
  'text="Không có dữ liệu"',
  'text="Không tìm thấy"',
  'text="Chưa có dữ liệu"',
  'text="Chưa có công việc"',
  'text="Chưa có ứng viên"',
  'text="Chưa có thông báo"',
];

/**
 * Checks if any loading state (Skeleton, Progress, Spinner) is currently visible.
 */
export async function isAnyLoadingVisible(page: Page): Promise<boolean> {
  for (const selector of LOADING_SELECTORS) {
    const loc = page.locator(selector).first();
    if ((await loc.count()) > 0) {
      try {
        if (await loc.isVisible()) {
          return true;
        }
      } catch {
        // Element might detach, continue checking
      }
    }
  }
  return false;
}

/**
 * Checks if the screen is completely blank or crashed (P0).
 */
export async function detectBlankScreen(page: Page, timeoutMs: number = 3000): Promise<{ isBlank: boolean; reason?: string }> {
  const startTime = Date.now();
  let lastReason = '';

  while (Date.now() - startTime <= timeoutMs) {
    try {
      // Check for Next.js crash overlay
      const nextError = page.locator('#next-error-box, [data-nextjs-dialog-overlay]').first();
      if ((await nextError.count()) > 0 && (await nextError.isVisible())) {
        return { isBlank: true, reason: 'Next.js unhandled runtime error overlay appeared' };
      }

      const bodyText = await page.evaluate(() => document.body.innerText.trim());
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const elementCount = await page.evaluate(() => document.querySelectorAll('*').length);

      if (bodyHeight >= 50 && elementCount >= 10 && (bodyText.length > 0 || (await isAnyLoadingVisible(page)))) {
        return { isBlank: false };
      }

      lastReason = `Page height is ${bodyHeight}px and contains only ${elementCount} elements with text length ${bodyText.length}`;
    } catch (err) {
      lastReason = (err as Error).message;
    }
    await page.waitForTimeout(300);
  }

  return { isBlank: true, reason: lastReason };
}

/**
 * Detects premature empty state during the loading phase (P0 / P1).
 * It is wrong to show "Không có dữ liệu" while the API is still in-flight.
 */
export async function detectPrematureEmptyState(page: Page): Promise<boolean> {
  for (const selector of EMPTY_STATE_SELECTORS) {
    const loc = page.locator(selector).first();
    if ((await loc.count()) > 0) {
      try {
        if (await loc.isVisible()) {
          return true;
        }
      } catch {
        // continue
      }
    }
  }
  return false;
}

/**
 * Checks if a full-page modal/backdrop blocks user interaction unnecessarily (P1).
 * Context: Table or card fetching should render in-place skeletons rather than a global blocking backdrop.
 */
export async function detectFullPageMasking(
  page: Page,
  options: { allowBackdropOnRoutes?: string[] } = {}
): Promise<{ isMasking: boolean; blockerSelector?: string }> {
  const backdropLocator = page.locator('.MuiBackdrop-root').first();
  if ((await backdropLocator.count()) > 0 && (await backdropLocator.isVisible())) {
    // Check if backdrop covers the full viewport (width/height ~ 100%)
    const box = await backdropLocator.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport && box.width >= viewport.width * 0.9 && box.height >= viewport.height * 0.9) {
      return { isMasking: true, blockerSelector: '.MuiBackdrop-root' };
    }
  }
  return { isMasking: false };
}

/**
 * Evaluates double-click protection on a submit button.
 * Clicks rapidly 2 times; verifies that exactly 1 request was sent and button was disabled.
 */
export async function evaluateDoubleSubmitGuard(
  page: Page,
  buttonLocator: Locator,
  requestsCountGetter: () => number
): Promise<{ passed: boolean; severity?: SeverityLevel; issue?: string; expected?: string }> {
  // Ensure button is ready
  await buttonLocator.waitFor({ state: 'visible', timeout: 10_000 });

  // Rapidly click twice
  await buttonLocator.click();
  try {
    await buttonLocator.click({ timeout: 200, force: true });
  } catch {
    // In good implementations, the second click is blocked because button is disabled or pointer-events: none
  }

  // Small delay to let network event dispatch
  await page.waitForTimeout(300);

  const count = requestsCountGetter();
  if (count > 1) {
    return {
      passed: false,
      severity: 'P0',
      issue: `Nút bấm không có cơ chế chống double-submit, gửi ${count} requests khi click liên tục.`,
      expected: 'Chỉ gửi 1 request duy nhất và lập tức vô hiệu hóa (disabled) nút bấm trong khi đang xử lý.',
    };
  }

  // Check if button is disabled while in-flight
  const isDisabled =
    (await buttonLocator.getAttribute('disabled')) !== null ||
    (await buttonLocator.getAttribute('aria-disabled')) === 'true' ||
    (await buttonLocator.evaluate((el) => (el as HTMLButtonElement).disabled));

  if (!isDisabled) {
    return {
      passed: false,
      severity: 'P1',
      issue: 'Nút bấm không chuyển sang trạng thái disabled khi đang submit.',
      expected: 'Nút bấm phải có disabled=true hoặc loading spinner để người dùng biết hệ thống đang xử lý.',
    };
  }

  return { passed: true };
}

/**
 * Helper to record a detected UX issue
 */
export function createUXIssue(params: {
  route: string;
  state: string;
  severity: SeverityLevel;
  issue: string;
  expected: string;
  screenshot?: string;
  request?: string;
  component?: string;
}): UXIssue {
  return {
    ...params,
    timestamp: new Date().toISOString(),
  };
}
