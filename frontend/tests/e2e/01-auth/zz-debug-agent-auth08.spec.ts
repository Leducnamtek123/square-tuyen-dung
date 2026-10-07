import { test } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks/index';
import { setupDomainAuthMocks } from '../../mocks/mock-auth';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

// TEMP debug spec (sẽ xóa) — truy vết luồng AUTH-08
test('debug AUTH-08 flow', async ({ page, context }) => {
  test.setTimeout(150_000);
  await setupAllApiMocks(page);
  await injectSession(context, DEFAULT_CANDIDATE);
  await setupDomainAuthMocks(page, { role: 'JOB_SEEKER', email: DEFAULT_CANDIDATE.email });
  await page.route('**/auth/user-info-basic/**', async (route) => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: 'x' }) });
  });
  await page.route('**/auth/token/**', async (route) => {
    const postData = route.request().postDataJSON() || {};
    if (postData.grant_type === 'refresh_token') {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: 'x' }) });
      return;
    }
    await route.fallback();
  });
  page.on('request', (r) => {
    const u = r.url();
    if (u.includes('/api/') || r.isNavigationRequest()) console.log('REQ', r.method(), u, r.headers()['authorization'] || '');
  });
  page.on('response', (r) => {
    const u = r.url();
    if (u.includes('/api/') || r.request().isNavigationRequest()) console.log('RES', r.status(), u);
  });
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) console.log('NAV', f.url()); });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('CONSOLE', m.type(), m.text().slice(0, 300)); });
  await page.goto('/account', { waitUntil: 'commit' }).catch((e) => console.log('GOTO ERR', String(e).slice(0, 200)));
  await page.waitForTimeout(60_000);
  console.log('COOKIES', JSON.stringify((await context.cookies(page.url())).map((c) => [c.name, c.value, c.domain])));
  console.log('URL', page.url());
});
