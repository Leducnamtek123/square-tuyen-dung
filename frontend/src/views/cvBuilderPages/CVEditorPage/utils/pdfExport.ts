/**
 * Export CV to high-quality print PDF using native browser print styles
 * formatted to exact A4 dimensions with zero margins, 100% color accuracy,
 * and high DPI rendering.
 */
export const printCVToPDF = async (
  elementId: string = 'cv-print-area',
  documentTitle: string = 'CV-Ung-Tuyen'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // 1. Wait for web fonts to be completely rendered
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness timeout
    }
  }

  // 2. Pre-load all images (avatar, icons) inside the printable CV
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 600);
      });
    })
  );

  const prevTitle = document.title;
  document.title = documentTitle;
  document.body.classList.add('cv-printing-active');

  // 3. Try direct native window.print()
  try {
    const handleAfterPrint = () => {
      document.title = prevTitle;
      document.body.classList.remove('cv-printing-active');
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);

    // Small raf to ensure layout reflow before browser opens print dialog
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        // Fallback cleanup if afterprint is cancelled
        setTimeout(() => {
          document.title = prevTitle;
          document.body.classList.remove('cv-printing-active');
        }, 3000);
      }, 50);
    });
  } catch (err) {
    console.warn('Native window.print failed, switching to isolated iframe print:', err);
    printViaIframeFallback(element, documentTitle);
  }
};

/**
 * Isolated high-fidelity print iframe fallback (for detached or constrained environments)
 */
const printViaIframeFallback = (element: HTMLElement, documentTitle: string) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '210mm';
  iframe.style.height = '297mm';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';

  document.body.appendChild(iframe);

  const pri = iframe.contentWindow;
  if (!pri) return;

  // Extract all CSSOM style rules from the current page
  let collectedStyles = '';
  try {
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        if (sheet.cssRules) {
          for (let j = 0; j < sheet.cssRules.length; j++) {
            collectedStyles += sheet.cssRules[j].cssText + '\n';
          }
        }
      } catch {
        if (sheet.href) {
          collectedStyles += `@import url("${sheet.href}");\n`;
        }
      }
    }
  } catch (e) {
    console.warn('Could not extract sheet rules:', e);
  }

  const existingStyleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  const printHtml = `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <title>${documentTitle}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Geist:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        ${existingStyleTags}
        <style>
          ${collectedStyles}
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            background: #ffffff !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow: visible !important;
          }
          .break-inside-avoid, .cv-break-avoid, .cv-item, .cv-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #cv-print-area {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            background: #ffffff !important;
          }
        </style>
      </head>
      <body>
        <div id="cv-print-area" style="width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff;">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `;

  pri.document.open();
  pri.document.write(printHtml);
  pri.document.close();

  const triggerPrint = () => {
    try {
      pri.focus();
      pri.print();
    } catch (e) {
      console.error('Iframe print error:', e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }
  };

  if (pri.document.readyState === 'complete') {
    setTimeout(triggerPrint, 350);
  } else {
    pri.onload = () => setTimeout(triggerPrint, 350);
  }
};

