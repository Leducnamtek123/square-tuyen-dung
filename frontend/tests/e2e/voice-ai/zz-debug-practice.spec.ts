import { test } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupCandidateProfileApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  setupVoiceAiApiMocks,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test('debug practice reload', async ({ page, context }) => {
  test.setTimeout(120_000);
  await setupCommonApiMocks(page);
  await setupCandidateProfileApiMocks(page);
  await setupJobsApiMocks(page);
  await setupAuthApiMocks(page, { role: 'JOB_SEEKER', id: DEFAULT_CANDIDATE.id, email: DEFAULT_CANDIDATE.email, fullName: DEFAULT_CANDIDATE.fullName });
  await injectSession(context, DEFAULT_CANDIDATE);
  await page.addInitScript(() => {
    window.localStorage.setItem('infohr_product_tour_completed_practice_room', 'true');
    window.addEventListener('beforeunload', () => console.log('BEFOREUNLOAD ' + new Error().stack));
  });
  await setupVoiceAiApiMocks(page);
  page.on('console', (m) => { const t = m.text(); if (/BEFOREUNLOAD|HMR|Fast Refresh|reload|error/i.test(t)) console.log('[console]', m.type(), t.slice(0, 400)); });
  page.on('request', (r) => { if (r.resourceType() === 'document' || r.url().includes('create-mock')) console.log('[req]', Date.now() % 100000, r.resourceType(), r.method(), r.url()); });
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) console.log('[nav]', Date.now() % 100000, f.url()); });
  await page.goto('/practice', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('start-set-mock-btn').first().waitFor({ timeout: 60000 });
  console.log('[btn-visible]', Date.now() % 100000);
  await page.waitForTimeout(20000);
  console.log('[end]', Date.now() % 100000, page.url());
});
