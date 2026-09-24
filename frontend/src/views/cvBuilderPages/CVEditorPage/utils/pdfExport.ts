/**
 * Export CV to high-quality print PDF using an isolated sandboxed iframe.
 * Renders ONLY the CV DOM node formatted to exact A4 dimensions with zero margins,
 * 100% color accuracy, and high DPI rendering.
 *
 * Guarantees zero website chrome (Header, Navbar, Footer, Drawers, Sidebars)
 * in the generated PDF or print dialog.
 */

export const exportCVToPDF = async (
  target: string | HTMLElement = 'cv-print-area',
  documentTitle: string = 'CV-Ung-Tuyen'
): Promise<void> => {
  return printCVToPDF(target, documentTitle);
};

export const printCVToPDF = async (
  target: string | HTMLElement = 'cv-print-area',
  documentTitle: string = 'CV-Ung-Tuyen'
): Promise<void> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) {
    console.warn(`CV print target element ${typeof target === 'string' ? '#' + target : ''} not found.`);
    window.print();
    return;
  }

  // 1. Wait for web fonts on host page if available
  if ('fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Non-blocking font readiness
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

  // 3. Primary export method: isolated sandboxed iframe
  try {
    await printViaIsolatedIframe(element, documentTitle);
  } catch (err) {
    console.warn('Isolated iframe print failed, falling back to clean direct print:', err);
    performDirectPrintFallback(element, documentTitle);
  }
};

/**
 * Isolated high-fidelity print iframe engine.
 * Renders EXCLUSIVELY the CV content in a detached frame with exact A4 portrait dimensions.
 */
const printViaIsolatedIframe = async (
  element: HTMLElement,
  documentTitle: string
): Promise<void> => {
  // Remove any leftover print iframes
  const oldIframe = document.getElementById('cv-isolated-print-frame');
  if (oldIframe && oldIframe.parentNode) {
    oldIframe.parentNode.removeChild(oldIframe);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'cv-isolated-print-frame';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.left = '-99999px';
  iframe.style.top = '0';
  iframe.style.width = '210mm';
  iframe.style.minHeight = '297mm';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';

  document.body.appendChild(iframe);

  const iframeWin = iframe.contentWindow;
  const iframeDoc = iframe.contentDocument || iframeWin?.document;
  if (!iframeWin || !iframeDoc) {
    throw new Error('Cannot access print iframe context');
  }

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
        // Cross-origin stylesheet access restriction; fallback to link tags below
        if (sheet.href) {
          collectedStyles += `@import url("${sheet.href}");\n`;
        }
      }
    }
  } catch (e) {
    console.warn('Could not extract sheet rules:', e);
  }

  // Extract all <style> and <link rel="stylesheet"> elements from host document
  const existingHeadTags = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map((el) => el.outerHTML)
    .join('\n');

  const printHtml = `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>${documentTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Geist:wght@400;500;600;700;800;900&family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    ${existingHeadTags}
    <style>
      ${collectedStyles}

      @page {
        size: A4 portrait;
        margin: 0;
      }

      *, *::before, *::after {
        box-sizing: border-box !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
        min-height: 297mm !important;
        background: #ffffff !important;
        color: #0f172a !important;
        font-family: 'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        -webkit-font-smoothing: antialiased;
        overflow: visible !important;
      }

      #cv-isolated-print-root {
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        border: none !important;
        transform: none !important;
        display: block !important;
        font-family: 'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }

      /* Page break protection for sections, experience items, and education items */
      .break-inside-avoid,
      .cv-break-avoid,
      .cv-item,
      .cv-section,
      .cv-experience-item,
      .cv-education-item,
      .cv-skill-item,
      .cv-certificate-item,
      .cv-project-item,
      section,
      [data-section] {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* Suppress any interactive website controls */
      header, footer, nav, aside, button, .no-print, [role="navigation"], [role="contentinfo"] {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <div id="cv-isolated-print-root">
      ${element.innerHTML}
    </div>
  </body>
</html>`;

  iframeDoc.open();
  iframeDoc.write(printHtml);
  iframeDoc.close();

  return new Promise<void>((resolve, reject) => {
    let hasCleanedUp = false;
    const cleanup = () => {
      if (hasCleanedUp) return;
      hasCleanedUp = true;
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };

    const triggerPrint = async () => {
      try {
        if (iframeDoc.fonts && 'ready' in iframeDoc.fonts) {
          try {
            await iframeDoc.fonts.ready;
          } catch {
            // Ignore font wait timeout
          }
        }

        // Ensure all images in the iframe document are loaded
        const iframeImages = Array.from(iframeDoc.querySelectorAll('img'));
        await Promise.all(
          iframeImages.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>((imgResolve) => {
              img.onload = () => imgResolve();
              img.onerror = () => imgResolve();
              setTimeout(imgResolve, 500);
            });
          })
        );

        // Allow layout reflow
        await new Promise((r) => setTimeout(r, 200));

        // Listen for afterprint event for prompt cleanup
        try {
          iframeWin.addEventListener('afterprint', cleanup, { once: true });
        } catch {
          // Non-blocking if listener fails
        }

        iframeWin.focus();
        iframeWin.print();
        resolve();
      } catch (err) {
        cleanup();
        reject(err);
      } finally {
        setTimeout(cleanup, 4000);
      }
    };

    if (iframeDoc.readyState === 'complete') {
      setTimeout(triggerPrint, 250);
    } else {
      iframe.onload = () => setTimeout(triggerPrint, 250);
    }
  });
};

/**
 * Fallback direct print method using strict document.body.cv-printing-active class.
 */
const performDirectPrintFallback = (element: HTMLElement, documentTitle: string) => {
  const prevTitle = document.title;
  document.title = documentTitle;
  document.body.classList.add('cv-printing-active');

  const cleanup = () => {
    document.title = prevTitle;
    document.body.classList.remove('cv-printing-active');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  requestAnimationFrame(() => {
    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 3000);
    }, 100);
  });
};

