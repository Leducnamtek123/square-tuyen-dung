import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(process.cwd());
const outDir = resolve(root, 'docs-end-user', 'images');

mkdirSync(outDir, { recursive: true });

const shots = [
  { name: '01-home.png', path: '/' },
  { name: '02-jobs.png', path: '/viec-lam' },
  { name: '03-companies.png', path: '/cong-ty' },
  { name: '04-login.png', path: '/dang-nhap' },
  { name: '05-register.png', path: '/dang-ky' },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1600 },
  deviceScaleFactor: 1,
});

page.setDefaultTimeout(60000);

for (const shot of shots) {
  const url = `http://127.0.0.1:3000${shot.path}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: resolve(outDir, shot.name), fullPage: true });
  console.log(`saved ${shot.name}`);
}

await browser.close();
