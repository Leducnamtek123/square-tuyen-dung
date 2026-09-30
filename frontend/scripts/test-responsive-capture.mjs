import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, '..', 'screenshots');

const breakpoints = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

const pagesToTest = [
  { name: 'home', path: '/' },
  { name: 'jobs', path: '/jobs' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'employer-login', path: '/employer/login' },
  { name: 'employer-dashboard', path: '/employer/dashboard' },
  { name: 'employer-job-posts', path: '/employer/job-posts' },
  { name: 'tra-cuu-luong', path: '/tra-cuu-luong' },
  { name: 'tao-cv', path: '/tao-cv' }
];

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const report = [];

  for (const pageInfo of pagesToTest) {
    console.log(`\n=== Testing ${pageInfo.name} (${pageInfo.path}) ===`);
    const pageReport = { page: pageInfo.name, url: pageInfo.path, viewports: {} };

    for (const bp of breakpoints) {
      const page = await context.newPage();
      await page.setViewportSize({ width: bp.width, height: bp.height });

      try {
        const fullUrl = `https://localhost${pageInfo.path}`;
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(async () => {
          // If networkidle times out (due to SSE or polling), wait for domcontentloaded
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000);
        });

        // Extra wait for animations and fonts
        await page.waitForTimeout(1000);

        // Check horizontal overflow
        const overflowData = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const clientWidth = docEl.clientWidth;
          const scrollWidth = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
          const hasHorizontalOverflow = scrollWidth > clientWidth + 1;

          const overflowing = [];
          if (hasHorizontalOverflow) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > clientWidth + 2) {
                overflowing.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id || undefined,
                  className: (typeof el.className === 'string' ? el.className.split(' ').slice(0, 5).join(' ') : ''),
                  overflowPx: Math.round(r.right - clientWidth)
                });
              }
            }
          }

          // UX & Visual layout checks
          const visualChecks = {
            hasDesktopNav: false,
            hasHamburger: false,
            teaserVisibleOnMobile: false
          };

          const desktopNav = document.querySelector('header nav, #common-header button[href*="/viec-lam"], #common-header a[href*="/viec-lam"]');
          if (desktopNav) {
            const style = window.getComputedStyle(desktopNav);
            visualChecks.hasDesktopNav = style.display !== 'none' && style.visibility !== 'hidden';
          }

          const hamburgerBtn = document.querySelector('#common-header button[aria-label*="Mở menu"], #common-header button[aria-label*="drawer"], #common-header .MuiIconButton-edgeStart');
          if (hamburgerBtn) {
            const style = window.getComputedStyle(hamburgerBtn);
            visualChecks.hasHamburger = style.display !== 'none' && style.visibility !== 'hidden';
          }

          const teaser = document.querySelector('.sq-chatbot__teaser');
          if (teaser) {
            const style = window.getComputedStyle(teaser);
            visualChecks.teaserVisibleOnMobile = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          }

          return {
            clientWidth,
            scrollWidth,
            hasHorizontalOverflow,
            overflowDiff: scrollWidth - clientWidth,
            overflowingElements: overflowing.slice(0, 5),
            visualChecks
          };
        });

        const screenshotPath = path.join(screenshotsDir, `${pageInfo.name}-${bp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        console.log(`[${bp.name}] scrollWidth: ${overflowData.scrollWidth} vs clientWidth: ${overflowData.clientWidth}. Overflow: ${overflowData.hasHorizontalOverflow ? 'YES (BUG!)' : 'None (OK)'}`);
        if (overflowData.hasHorizontalOverflow) {
          console.log('  Top overflowing elements:', JSON.stringify(overflowData.overflowingElements));
        }
        if (bp.name === 'laptop-1024') {
          console.log(`  [laptop-1024 UX Check] Hamburger: ${overflowData.visualChecks.hasHamburger ? 'Visible' : 'Hidden (Good)'}, Desktop Nav: ${overflowData.visualChecks.hasDesktopNav ? 'Visible (Good)' : 'Hidden'}`);
        }
        if (bp.name === 'mobile-375') {
          console.log(`  [mobile-375 UX Check] Teaser blocking UI: ${overflowData.visualChecks.teaserVisibleOnMobile ? 'YES (BUG!)' : 'No (Good)'}`);
        }

        pageReport.viewports[bp.name] = {
          ...overflowData,
          screenshot: `${pageInfo.name}-${bp.name}.png`
        };
      } catch (err) {
        console.error(`Error on ${pageInfo.name} at ${bp.name}:`, err.message);
        pageReport.viewports[bp.name] = { error: err.message };
      } finally {
        await page.close();
      }
    }

    report.push(pageReport);
  }

  await browser.close();

  // Save report JSON
  import('fs').then(fs => {
    fs.writeFileSync(path.join(screenshotsDir, 'responsive-report.json'), JSON.stringify(report, null, 2));
    console.log('\nReport written to frontend/screenshots/responsive-report.json');
  });
}

run().catch(console.error);
