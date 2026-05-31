import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import type { Page } from '@playwright/test';

// Opt-in live FE -> BE smoke for the full recruitment flow.
// Prerequisites:
// - Docker backend container is running and reachable, default: tuyendung-studio-backend.
// - A frontend dev server is reachable at PLAYWRIGHT_BASE_URL, default Playwright config uses localhost:3000.
// PowerShell example:
//   $env:LIVE_RECRUITMENT_E2E='1'; $env:PLAYWRIGHT_BASE_URL='http://localhost:3002'; npx playwright test tests/recruitment-flow-live.spec.ts --project=chromium --reporter=line
// Bash example:
//   LIVE_RECRUITMENT_E2E=1 PLAYWRIGHT_BASE_URL=http://localhost:3002 npx playwright test tests/recruitment-flow-live.spec.ts --project=chromium --reporter=line
// The test creates timestamped users/job/application/interview records and deletes them in finally.

type SeedData = {
  adminEmail: string;
  candidateEmail: string;
  candidateId: number;
  employerEmail: string;
  jobId: number;
  jobName: string;
  jobSlug: string;
  password: string;
  resumeId: number;
  stamp: string;
};

const enabled = process.env.LIVE_RECRUITMENT_E2E === '1';
const backendContainer = process.env.LIVE_RECRUITMENT_BACKEND_CONTAINER || 'tuyendung-studio-backend';

test.use({
  permissions: ['microphone', 'camera'],
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
});

const runDjangoShell = (code: string) =>
  execFileSync('docker', ['exec', '-i', backendContainer, 'python', 'manage.py', 'shell'], {
    input: code,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

const parseLastJsonLine = <T,>(output: string): T => {
  const line = output
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.startsWith('{') && item.endsWith('}'))
    .pop();
  if (!line) throw new Error(`No JSON payload found in Django shell output:\n${output}`);
  return JSON.parse(line) as T;
};

const cleanText = (value: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0111\u0110]/g, 'd')
    .toLowerCase();

const seedData = (): SeedData => {
  const output = runDjangoShell(String.raw`
import datetime, json, time
from django.utils import timezone
from apps.accounts.models import User
from apps.jobs.models import JobPost
from apps.locations.models import City, District, Location
from apps.profiles.models import Company, JobSeekerProfile, Resume
from common.models import Career
from shared.configs import variable_system as var_sys

stamp = str(int(time.time()))
password = 'Password123!'
city = City.objects.create(name=f'Codex Live E2E City {stamp}', code=f'LE{stamp[-6:]}')
district = District.objects.create(name=f'Codex Live E2E District {stamp}', city=city, code=f'LD{stamp[-6:]}')
location = Location.objects.create(city=city, district=district, address=f'Codex Live E2E Address {stamp}', lat=10.781, lng=106.700)
career, _ = Career.objects.get_or_create(name='Codex Live E2E Career')

candidate = User.objects.create_user_with_role_name(
    email=f'codex-live-candidate-{stamp}@example.com',
    full_name=f'Codex Live Candidate {stamp}',
    role_name=var_sys.JOB_SEEKER,
    password=password,
    is_active=True,
    is_verify_email=True,
)
profile = JobSeekerProfile.objects.create(user=candidate, phone='090' + stamp[-7:], location=location)
resume = Resume.objects.create(
    title=f'Codex Live Online Resume {stamp}',
    description='Browser E2E resume',
    salary_min=10000000,
    salary_max=20000000,
    experience=2,
    is_active=True,
    type=var_sys.CV_WEBSITE,
    user=candidate,
    job_seeker_profile=profile,
    career=career,
    city=city,
)

employer = User.objects.create_user_with_role_name(
    email=f'codex-live-employer-{stamp}@example.com',
    full_name=f'Codex Live Employer {stamp}',
    role_name=var_sys.EMPLOYER,
    password=password,
    is_active=True,
    is_verify_email=True,
    has_company=True,
)
company = Company.objects.create(
    company_name=f'Codex Live Company {stamp}',
    company_email=f'codex-live-company-{stamp}@example.com',
    company_phone='091' + stamp[-7:],
    tax_code='9' + stamp[-9:],
    employee_size=100,
    is_verified=True,
    user=employer,
    location=location,
    field_operation='Recruitment E2E',
)

job = JobPost.objects.create(
    job_name=f'Codex Live Interior Designer {stamp}',
    deadline=timezone.now().date() + datetime.timedelta(days=30),
    quantity=1,
    job_description='<p>Browser E2E job description</p>',
    job_requirement='<p>Browser E2E job requirement</p>',
    benefits_enjoyed='<p>Browser E2E benefits</p>',
    position=4,
    type_of_workplace=1,
    experience=2,
    academic_level=2,
    job_type=1,
    salary_min=10000000,
    salary_max=20000000,
    contact_person_name='Codex HR',
    contact_person_phone='092' + stamp[-7:],
    contact_person_email=f'codex-live-hr-{stamp}@example.com',
    status=var_sys.JobPostStatus.APPROVED,
    user=employer,
    company=company,
    career=career,
    location=location,
)

admin = User.objects.create_user_with_role_name(
    email=f'codex-live-admin-{stamp}@example.com',
    full_name=f'Codex Live Admin {stamp}',
    role_name=var_sys.ADMIN,
    password=password,
    is_active=True,
    is_verify_email=True,
    is_staff=True,
    is_superuser=True,
)

print(json.dumps({
    'stamp': stamp,
    'password': password,
    'candidateEmail': candidate.email,
    'candidateId': candidate.id,
    'employerEmail': employer.email,
    'adminEmail': admin.email,
    'jobId': job.id,
    'jobSlug': job.slug,
    'jobName': job.job_name,
    'resumeId': resume.id,
}, ensure_ascii=False))
`);
  return parseLastJsonLine<SeedData>(output);
};

const cleanupData = (data: SeedData) => {
  runDjangoShell(String.raw`
from apps.accounts.models import User
from apps.jobs.models import JobPost, JobPostActivity
from apps.interviews.models import InterviewSession
from apps.locations.models import City, District, Location
from apps.profiles.models import Company, JobSeekerProfile, Resume
from common.models import Career

stamp = '${data.stamp}'
job_ids = list(JobPost.objects.filter(job_name__contains=stamp).values_list('id', flat=True))
user_ids = list(User.objects.filter(email__contains=stamp).values_list('id', flat=True))
InterviewSession.objects.filter(job_post_id__in=job_ids).delete()
JobPostActivity.objects.filter(job_post_id__in=job_ids).delete()
JobPost.objects.filter(id__in=job_ids).delete()
Resume.objects.filter(user_id__in=user_ids).delete()
JobSeekerProfile.objects.filter(user_id__in=user_ids).delete()
Company.objects.filter(company_name__contains=stamp).delete()
User.objects.filter(id__in=user_ids).delete()
Location.objects.filter(address__contains=stamp).delete()
District.objects.filter(name__contains=stamp).delete()
City.objects.filter(name__contains=stamp).delete()
career = Career.objects.filter(name='Codex Live E2E Career').first()
if career and not career.job_posts.exists() and not career.resumes.exists():
    career.delete()
print({'cleanup': stamp})
`);
};

const latestSession = (data: SeedData) => {
  const output = runDjangoShell(String.raw`
import json
from apps.interviews.models import InterviewSession
s = InterviewSession.objects.filter(candidate_id=${data.candidateId}, job_post_id=${data.jobId}).order_by('-id').first()
print(json.dumps({
    'id': s.id,
    'inviteToken': s.invite_token,
    'roomName': s.room_name,
    'status': s.status,
} if s else {}, ensure_ascii=False))
`);
  return parseLastJsonLine<{ id: number; inviteToken: string; roomName: string; status: string }>(output);
};

const failOnBrowserErrors = (page: Page) => {
  const failures: string[] = [];
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !text.includes('Could not reach Cloud Firestore backend')) {
      failures.push(text);
    }
  });
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/api/') && response.status() >= 400) {
      failures.push(`${response.status()} ${response.request().method()} ${url}`);
    }
  });
  return failures;
};

const login = async (page: Page, path: string, email: string, password: string) => {
  await safeGoto(page, path);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/auth/token/') && response.status() === 200),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForLoadState('networkidle').catch(() => undefined);
};

const safeGoto = async (page: Page, path: string) => {
  try {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    if (!String(error).includes('ERR_ABORTED')) throw error;
  }
};

const expectBodyToContainClean = async (page: Page, pattern: RegExp, timeout = 30_000) => {
  await expect
    .poll(async () => cleanText(await page.locator('body').innerText()), { timeout })
    .toMatch(pattern);
};

const clickByCleanText = async (page: Page, pattern: RegExp, timeout = 30_000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const clicked = await page.evaluate((source) => {
      const clean = (value: string) =>
        (value || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[\u0111\u0110]/g, 'd')
          .toLowerCase();
      const re = new RegExp(source, 'i');
      const target = Array.from(document.querySelectorAll('button, a, [role="button"]')).find(
        (node) => re.test(clean(node.textContent || node.getAttribute('aria-label') || '')) && !(node as HTMLButtonElement).disabled,
      );
      if (!target) return false;
      (target as HTMLElement).click();
      return true;
    }, pattern.source);
    if (clicked) return;
    await page.waitForTimeout(300);
  }
  throw new Error(`No clickable element matched ${pattern.source}`);
};

test.describe('Live recruitment flow', () => {
  test.skip(!enabled, 'Set LIVE_RECRUITMENT_E2E=1 to run this destructive live FE -> BE browser test.');

  test('candidate applies, employer schedules, candidate joins, admin monitors', async ({ browser }) => {
    test.setTimeout(360_000);

    const data = seedData();

    try {
      const candidateContext = await browser.newContext({
        permissions: ['microphone', 'camera'],
        viewport: { width: 1440, height: 1000 },
      });

      const candidatePage = await candidateContext.newPage();
      let failures = failOnBrowserErrors(candidatePage);

      await login(candidatePage, '/login', data.candidateEmail, data.password);
      await safeGoto(candidatePage, `/jobs/${data.jobSlug}`);
      await expect(candidatePage.locator('body')).toContainText(data.jobName, { timeout: 30_000 });
      await clickByCleanText(candidatePage, /nop ho so|ung tuyen|apply/);
      await candidatePage.locator(`input[type="radio"][value="${data.resumeId}"]`).check({ force: true });
      await candidatePage.locator('input#fullName').fill(`Codex Live Candidate ${data.stamp}`);
      await candidatePage.locator('input#email').fill(data.candidateEmail);
      await candidatePage.locator('input#phone').fill(`090${data.stamp.slice(-7)}`);
      await Promise.all([
        candidatePage.waitForResponse(
          (response) =>
            response.url().includes('/api/job/web/job-seeker-job-posts-activity/') &&
            response.request().method() === 'POST' &&
            [200, 201].includes(response.status()),
        ),
        candidatePage.locator('button[type="submit"]').last().click(),
      ]);
      await expectBodyToContainClean(candidatePage, /da ung tuyen/);
      expect(failures).toEqual([]);
      await candidateContext.close();

      const employerContext = await browser.newContext({
        permissions: ['microphone', 'camera'],
        viewport: { width: 1440, height: 1000 },
      });
      const employerPage = await employerContext.newPage();
      failures = failOnBrowserErrors(employerPage);
      await login(employerPage, '/employer/login', data.employerEmail, data.password);
      await safeGoto(employerPage, '/employer/applied-profiles');
      await expect(employerPage.getByText(`Codex Live Candidate ${data.stamp}`).first()).toBeVisible({ timeout: 30_000 });
      await safeGoto(employerPage, `/employer/interviews/create?candidate=${data.candidateId}&jobPost=${data.jobId}`);
      await employerPage.locator('[role="spinbutton"][aria-label="Day"]').click();
      await employerPage.keyboard.type('250620261000');
      await Promise.all([
        employerPage.waitForResponse(
          (response) =>
            response.url().includes('/api/interview/web/sessions/') &&
            response.request().method() === 'POST' &&
            [200, 201].includes(response.status()),
        ),
        employerPage.locator('button[type="submit"]').first().click(),
      ]);
      await expectBodyToContainClean(employerPage, /len lich phong van thanh cong/);
      expect(failures).toEqual([]);
      await employerContext.close();

      const session = latestSession(data);
      expect(session.inviteToken).toBeTruthy();
      expect(session.roomName).toBeTruthy();

      const interviewContext = await browser.newContext({
        permissions: ['microphone', 'camera'],
        viewport: { width: 1440, height: 1000 },
      });
      const interviewPage = await interviewContext.newPage();
      failures = failOnBrowserErrors(interviewPage);
      await login(interviewPage, '/login', data.candidateEmail, data.password);
      await safeGoto(interviewPage, '/my-interviews');
      await expect(interviewPage.locator('body')).toContainText(data.jobName, { timeout: 30_000 });
      await safeGoto(interviewPage, `/interview/${session.inviteToken}`);
      await clickByCleanText(interviewPage, /bat dau|start/);
      await Promise.all([
        interviewPage.waitForResponse(
          (response) =>
            response.url().includes(`/api/interview/web/sessions/invite/${session.inviteToken}/livekit-token/`) &&
            response.status() === 200,
        ),
        clickByCleanText(interviewPage, /tham gia|join/),
      ]);
      await expectBodyToContainClean(interviewPage, /dang dien ra/);
      expect(failures).toEqual([]);
      expect(latestSession(data).status).toBe('in_progress');
      await interviewContext.close();

      const adminContext = await browser.newContext({
        permissions: ['microphone', 'camera'],
        viewport: { width: 1440, height: 1000 },
      });
      const adminPage = await adminContext.newPage();
      failures = failOnBrowserErrors(adminPage);
      await login(adminPage, '/admin/login', data.adminEmail, data.password);
      await clickByCleanText(adminPage, /lich phong van/);
      await expect(adminPage.locator('body')).toContainText(String(session.id), { timeout: 30_000 });
      await expect(adminPage.locator('body')).toContainText(data.jobName, { timeout: 30_000 });
      await expectBodyToContainClean(adminPage, /dang dien ra/);
      expect(failures).toEqual([]);

      await adminContext.close();
    } finally {
      cleanupData(data);
    }
  });
});
