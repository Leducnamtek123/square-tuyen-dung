import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

describe('CV Everything Print PDF Isolation & Zero Website Chrome Test Suite', () => {
  const pdfExportPath = join(__dirname, '../CVEditorPage/utils/pdfExport.ts');
  const globalsCssPath = join(__dirname, '../../../../src/app/globals.css');
  const candidateFooterPath = join(__dirname, '../../../../src/layouts/components/commons/Footer/CandidateFooter.tsx');
  const employerFooterPath = join(__dirname, '../../../../src/layouts/components/commons/Footer/EmployerFooter.tsx');
  const managementFooterPath = join(__dirname, '../../../../src/layouts/components/commons/ManagementFooter.tsx');
  const headerPath = join(__dirname, '../../../../src/layouts/components/commons/Header/index.tsx');

  const pdfExportSource = readFileSync(pdfExportPath, 'utf8');
  const globalsCssSource = readFileSync(globalsCssPath, 'utf8');
  const candidateFooterSource = readFileSync(candidateFooterPath, 'utf8');
  const employerFooterSource = readFileSync(employerFooterPath, 'utf8');
  const managementFooterSource = readFileSync(managementFooterPath, 'utf8');
  const headerSource = readFileSync(headerPath, 'utf8');

  // ============================================================================
  // 1. pdfExport.ts Engine Tests
  // ============================================================================
  describe('pdfExport.ts Isolated Sandboxed Print Engine', () => {
    it('uses printViaIsolatedIframe as primary export engine', () => {
      expect(pdfExportSource).toContain('printViaIsolatedIframe');
      expect(pdfExportSource).toContain('cv-isolated-print-frame');
    });

    it('sets iframe dimensions to exact A4 with detached positioning', () => {
      expect(pdfExportSource).toContain("iframe.style.width = '210mm'");
      expect(pdfExportSource).toContain("iframe.style.minHeight = '297mm'");
      expect(pdfExportSource).toContain("iframe.style.left = '-99999px'");
    });

    it('enforces exact A4 page styles and color fidelity in iframe HTML', () => {
      expect(pdfExportSource).toContain('size: A4 portrait');
      expect(pdfExportSource).toContain('print-color-adjust: exact !important');
      expect(pdfExportSource).toContain('-webkit-print-color-adjust: exact !important');
    });

    it('waits for web fonts and images to load before opening print dialog', () => {
      expect(pdfExportSource).toContain('document.fonts.ready');
      expect(pdfExportSource).toContain('iframeDoc.fonts.ready');
      expect(pdfExportSource).toContain('iframeImages.map');
      expect(pdfExportSource).toContain('img.onload');
    });

    it('suppresses website chrome inside the print iframe template', () => {
      expect(pdfExportSource).toContain('header, footer, nav, aside, button, .no-print');
      expect(pdfExportSource).toContain('display: none !important');
    });

    it('cleans up iframe after print dialog completes', () => {
      expect(pdfExportSource).toContain('document.body.removeChild(iframe)');
    });
  });

  // ============================================================================
  // 2. globals.css @media print Rules Tests
  // ============================================================================
  describe('globals.css Print Isolation Rules', () => {
    it('hides header, footer, and navigation unconditionally in @media print', () => {
      expect(globalsCssSource).toMatch(/header,\s*footer,\s*nav,\s*aside/);
      expect(globalsCssSource).toContain('#common-header');
      expect(globalsCssSource).toContain('#common-footer');
      expect(globalsCssSource).toContain('[role="contentinfo"]');
      expect(globalsCssSource).toContain('[role="navigation"]');
    });

    it('hides non-CV layout siblings when cv-printing-active or printing CV', () => {
      expect(globalsCssSource).toContain('body.cv-printing-active > *:not(:has(#cv-print-area)):not(#cv-print-area)');
      expect(globalsCssSource).toContain('*:has(#cv-print-area) > *:not(:has(#cv-print-area)):not(#cv-print-area)');
    });

    it('unwraps and resets all ancestors of #cv-print-area', () => {
      expect(globalsCssSource).toContain(':has(#cv-print-area)');
      expect(globalsCssSource).toContain('.MuiContainer-root:has(#cv-print-area)');
    });

    it('enforces 210mm width and exact A4 bounds for #cv-print-area', () => {
      expect(globalsCssSource).toContain('#cv-print-area {');
      expect(globalsCssSource).toContain('width: 210mm !important');
      expect(globalsCssSource).toContain('min-height: 297mm !important');
    });
  });

  // ============================================================================
  // 3. Layout Chrome Defense-in-Depth Tests
  // ============================================================================
  describe('Layout Chrome Defense-in-Depth (no-print classes)', () => {
    it('CandidateFooter has className="no-print"', () => {
      expect(candidateFooterSource).toContain('className="no-print"');
    });

    it('EmployerFooter has className="no-print"', () => {
      expect(employerFooterSource).toContain('className="no-print"');
    });

    it('ManagementFooter has className="no-print"', () => {
      expect(managementFooterSource).toContain('className="no-print"');
    });

    it('Header AppBar has className="no-print"', () => {
      expect(headerSource).toContain('className="no-print"');
    });
  });

  // ============================================================================
  // 4. Vietnamese Typography & Zero Parentheses Compliance Tests
  // ============================================================================
  describe('Zero Vietnamese Parentheses Compliance across cvBuilderPages', () => {
    const scanDir = (dir: string): string[] => {
      let files: string[] = [];
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const full = join(dir, entry);
        const st = statSync(full);
        if (st.isDirectory()) {
          if (entry !== '__tests__' && entry !== 'node_modules') {
            files = files.concat(scanDir(full));
          }
        } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
          files.push(full);
        }
      }
      return files;
    };

    it('confirms all cvBuilderPages source files contain zero Vietnamese characters inside parentheses', () => {
      const cvPagesDir = join(__dirname, '..');
      const files = scanDir(cvPagesDir);
      const vietnameseCharRegex = /[\u00C0-\u1EF9]/;

      const violations: string[] = [];
      for (const file of files) {
        const content = readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
            return;
          }

          // Extract quoted string literals
          const stringMatches = line.match(/(['"`])(.*?)\1/g) || [];
          for (const str of stringMatches) {
            // Check if this string literal contains parentheses AND Vietnamese text
            if ((str.includes('(') || str.includes(')')) && vietnameseCharRegex.test(str)) {
              violations.push(`${file}:${idx + 1} -> ${trimmed}`);
            }
          }

          // Check JSX text nodes outside tags: > ... (tiếng Việt) ... <
          const jsxTextMatches = line.match(/>([^<]+)</g) || [];
          for (const jsxText of jsxTextMatches) {
            const inner = jsxText.slice(1, -1).trim();
            if ((inner.includes('(') || inner.includes(')')) && vietnameseCharRegex.test(inner)) {
              violations.push(`${file}:${idx + 1} -> ${trimmed}`);
            }
          }
        });
      }

      expect(violations).toEqual([]);
    });
  });
});
