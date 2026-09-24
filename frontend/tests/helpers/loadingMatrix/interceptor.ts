import type { Page, Route } from '@playwright/test';

export interface DelayedApiOptions {
  delayMs?: number;
  fulfillWith?: {
    status?: number;
    contentType?: string;
    body?: unknown;
  };
}

/**
 * Intercepts matching API calls and delays them by delayMs (defaults to 3000ms).
 * Useful to observe the loading UI, skeleton, and interaction guards.
 */
export async function delayApi(
  page: Page,
  urlPattern: string | RegExp,
  options: DelayedApiOptions = {}
) {
  const delayMs = options.delayMs ?? 3000;
  await page.route(urlPattern, async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    if (options.fulfillWith) {
      await route.fulfill({
        status: options.fulfillWith.status ?? 200,
        contentType: options.fulfillWith.contentType ?? 'application/json',
        body:
          typeof options.fulfillWith.body === 'string'
            ? options.fulfillWith.body
            : JSON.stringify(options.fulfillWith.body ?? {}),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Intercepts matching API calls and fulfills with empty dataset (e.g., [] or { count: 0, results: [] }).
 */
export async function mockEmptyApi(
  page: Page,
  urlPattern: string | RegExp,
  customEmptyPayload?: unknown
) {
  const payload = customEmptyPayload ?? {
    count: 0,
    results: [],
    data: [],
  };

  await page.route(urlPattern, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });
}

/**
 * Intercepts matching API calls and returns an HTTP error (500, 401, 403, 404, 422, 429).
 */
export async function mockErrorApi(
  page: Page,
  urlPattern: string | RegExp,
  statusCode: number = 500,
  errorMessage: string = 'Internal Server Error'
) {
  await page.route(urlPattern, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'error',
        statusCode,
        message: errorMessage,
        detail: errorMessage,
      }),
    });
  });
}

/**
 * Simulates network offline or failed connection for the matched API.
 */
export async function mockOfflineApi(
  page: Page,
  urlPattern: string | RegExp = /\/api\//
) {
  await page.route(urlPattern, async (route: Route) => {
    await route.abort('failed');
  });
}

export interface SubmissionTracker {
  getRequestsCount: () => number;
  getPayloads: () => unknown[];
  reset: () => void;
}

/**
 * Tracks mutation submissions (POST/PUT/PATCH) to detect duplicate requests.
 * Optionally delays the response to test button disabled state while in-flight.
 */
export async function trackSubmissions(
  page: Page,
  urlPattern: string | RegExp,
  delayMs: number = 1500,
  fulfillSuccessPayload: unknown = { success: true, id: 999 }
): Promise<SubmissionTracker> {
  let count = 0;
  const payloads: unknown[] = [];

  await page.route(urlPattern, async (route: Route) => {
    const method = route.request().method();
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      count++;
      try {
        const postData = route.request().postDataJSON();
        payloads.push(postData);
      } catch {
        payloads.push(route.request().postData());
      }

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fulfillSuccessPayload),
      });
      return;
    }

    await route.continue();
  });

  return {
    getRequestsCount: () => count,
    getPayloads: () => payloads,
    reset: () => {
      count = 0;
      payloads.length = 0;
    },
  };
}

/**
 * Mocks an API that fails first, then succeeds when retried.
 */
export async function mockRetryApi(
  page: Page,
  urlPattern: string | RegExp,
  successPayload: unknown,
  failCount: number = 1
) {
  let attempts = 0;
  await page.route(urlPattern, async (route: Route) => {
    attempts++;
    if (attempts <= failCount) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Tạm thời mất kết nối máy chủ' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successPayload),
      });
    }
  });
}
