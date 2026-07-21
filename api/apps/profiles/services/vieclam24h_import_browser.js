const path = require('path');
const { URL } = require('url');

const { chromium } = require(path.join(process.cwd(), 'frontend', 'node_modules', 'playwright'));

const SOURCE_URL = process.env.SOURCE_URL;
const SOURCE_USERNAME = process.env.SOURCE_USERNAME;
const SOURCE_PASSWORD = process.env.SOURCE_PASSWORD;

function pickText(value, keys) {
  if (!value || typeof value !== 'object') return '';
  for (const key of keys) {
    const raw = value[key];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  }
  return '';
}

function extractNestedObject(value) {
  if (!value || typeof value !== 'object') return {};
  const nestedKeys = ['user', 'candidate', 'profile', 'resume', 'data', 'item', 'row'];
  for (const key of nestedKeys) {
    if (value[key] && typeof value[key] === 'object' && !Array.isArray(value[key])) {
      return value[key];
    }
  }
  return value;
}

function normalizeCandidate(value, fallbackSourceUrl) {
  const source = extractNestedObject(value);
  const isCandidateLike = Boolean(
    source.token_sms ||
    source.token_email ||
    source.last_apply_resume_id ||
    source.last_apply_at ||
    source.province_id ||
    source.district_id ||
    source.job_search_status !== undefined
  );
  if (!isCandidateLike) return null;
  if (
    source.role === 'employer' ||
    source.nameOfCompany ||
    source.service_type ||
    source.position_key ||
    source.banner_type ||
    source.group_key ||
    source.channel_code
  ) {
    return null;
  }

  const fullName = pickText(source, ['fullName', 'full_name', 'name', 'candidateName', 'candidate_name']);
  const email = pickText(source, ['email', 'mail', 'contactEmail', 'contact_email']);
  const phone = pickText(source, ['phone', 'phoneNumber', 'phone_number', 'mobile', 'contactPhone', 'contact_phone']);
  const title = pickText(source, ['title', 'jobTitle', 'job_title', 'position', 'headline', 'currentJobTitle', 'current_job_title']) || fullName;
  const careerName = pickText(source, ['careerName', 'career_name', 'industry', 'occupation', 'occupationName', 'field', 'field_name']);
  const cityName = pickText(source, ['cityName', 'city_name', 'locationName', 'location_name', 'city']);
  const sourceRef = pickText(source, ['sourceRef', 'source_ref', 'id', 'candidateId', 'candidate_id', 'slug', 'profileId', 'profile_id']);
  const skillsSummary = pickText(source, ['skillsSummary', 'skills_summary', 'skills', 'summary']);
  const description = pickText(source, ['description', 'bio', 'summary', 'about']);

  if (!fullName) return null;
  if (!email && !phone && !title && !skillsSummary && !description) return null;

  return {
    full_name: fullName,
    email,
    phone,
    title,
    career_name: careerName,
    city_name: cityName,
    source_ref: sourceRef,
    source_url: fallbackSourceUrl,
    source_payload: source,
    skills_summary: skillsSummary,
    description,
  };
}

function walkJson(value, fallbackSourceUrl, candidates, seen) {
  if (Array.isArray(value)) {
    for (const item of value) {
      walkJson(item, fallbackSourceUrl, candidates, seen);
    }
    return;
  }

  if (!value || typeof value !== 'object') return;

  const normalized = normalizeCandidate(value, fallbackSourceUrl);
  if (normalized) {
    const key = normalized.source_ref || normalized.email || normalized.phone || normalized.full_name;
    if (key && !seen.has(key)) {
      seen.add(key);
      candidates.push(normalized);
    }
  }

  for (const entry of Object.values(value)) {
    walkJson(entry, fallbackSourceUrl, candidates, seen);
  }
}

async function scrapeFromDom(page, fallbackSourceUrl) {
  const selectors = [
    'table tbody tr',
    '[role="row"]',
    'article',
    'li',
    '.candidate',
    '.resume',
    '.profile',
    '.card',
  ];
  const candidates = [];
  const seen = new Set();

  for (const selector of selectors) {
    const rows = await page.locator(selector).evaluateAll((elements) =>
      elements.map((element) => ({
        text: (element.innerText || '').trim(),
        href: element.querySelector('a') ? element.querySelector('a').href : '',
      })),
    ).catch(() => []);

    for (const row of rows) {
      const text = row.text || '';
      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) continue;
      const combined = lines.join(' ');
      const emailMatch = combined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      const phoneMatch = combined.match(/(\+?\d[\d\s().-]{7,}\d)/);
      const name = lines[0];
      const key = row.href || emailMatch?.[0] || phoneMatch?.[0] || name;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      if (name.length < 3) continue;

      candidates.push({
        full_name: name,
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        title: lines[1] || name,
        career_name: '',
        city_name: '',
        source_ref: key,
        source_url: fallbackSourceUrl,
        source_payload: { text: combined, href: row.href || '' },
        skills_summary: '',
        description: combined,
      });
    }
  }

  return candidates;
}

(async () => {
  if (!SOURCE_URL) {
    throw new Error('SOURCE_URL is required.');
  }
  if (!SOURCE_USERNAME) {
    throw new Error('SOURCE_USERNAME is required.');
  }
  if (!SOURCE_PASSWORD) {
    throw new Error('SOURCE_PASSWORD is required.');
  }

  const baseUrl = new URL(SOURCE_URL);
  const loginUrl = new URL('/account/login', baseUrl.origin).toString();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const jsonPayloads = [];

  page.on('response', async (response) => {
    const contentType = response.headers()['content-type'] || '';
    if (!contentType.includes('application/json')) return;
    try {
      jsonPayloads.push(await response.json());
    } catch (error) {
      // ignore non-JSON payloads that report a JSON content type
    }
  });

  try {
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.locator('input[name="email"]').fill(SOURCE_USERNAME);
    await page.locator('input[name="password"]').fill(SOURCE_PASSWORD);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.getByRole('button', { name: /Đăng nhập/i }).click(),
    ]);

    await page.goto(SOURCE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const candidates = [];
    const seen = new Set();
    for (const payload of jsonPayloads) {
      walkJson(payload, SOURCE_URL, candidates, seen);
    }

    if (!candidates.length) {
      const domCandidates = await scrapeFromDom(page, SOURCE_URL);
      for (const candidate of domCandidates) {
        const key = candidate.source_ref || candidate.email || candidate.phone || candidate.full_name;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        candidates.push(candidate);
      }
    }

    process.stdout.write(JSON.stringify({ candidates }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  process.stderr.write(`${error && error.stack ? error.stack : String(error)}\n`);
  process.exit(1);
});
