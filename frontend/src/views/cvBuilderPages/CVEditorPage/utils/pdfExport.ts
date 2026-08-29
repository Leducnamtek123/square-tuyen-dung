/**
 * Export CV to high-quality print PDF using native browser print styles
 * formatted to exact A4 dimensions with zero margins and high DPI.
 */
export const printCVToPDF = (elementId: string = 'cv-print-area', documentTitle: string = 'CV-Ung-Tuyen') => {
  if (typeof window === 'undefined') return;

  const element = document.getElementById(elementId) || (document.querySelector('.cv-print-target') as HTMLElement | null);
  const sanitizedTitle = (documentTitle || 'CV_Ung_Tuyen').replace(/[/\\?%*:|"<>]/g, '_');
  const originalTitle = document.title;

  const fallbackWindowPrint = () => {
    document.title = sanitizedTitle;
    document.documentElement.classList.add('cv-printing-active');
    document.body.classList.add('cv-printing-active');

    const cleanUp = () => {
      document.title = originalTitle;
      document.documentElement.classList.remove('cv-printing-active');
      document.body.classList.remove('cv-printing-active');
      window.removeEventListener('afterprint', cleanUp);
    };

    window.addEventListener('afterprint', cleanUp, { once: true });

    setTimeout(() => {
      window.print();
      setTimeout(cleanUp, 3000);
    }, 150);
  };

  if (!element) {
    fallbackWindowPrint();
    return;
  }

  // Create an isolated printable iframe
  try {
    const existingIframe = document.getElementById('cv-isolated-print-iframe');
    if (existingIframe && existingIframe.parentNode) {
      existingIframe.parentNode.removeChild(existingIframe);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'cv-isolated-print-iframe';
    // Chromium requires the iframe to have actual physical dimensions in the render tree
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-99999';
    iframe.style.opacity = '0.001';
    iframe.style.pointerEvents = 'none';

    document.body.appendChild(iframe);

    const pri = iframe.contentWindow;
    const doc = iframe.contentDocument || pri?.document;

    if (!pri || !doc) {
      fallbackWindowPrint();
      return;
    }

    // Collect all active styles and link tags from host page
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');

    const printHtml = `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <title>${sanitizedTitle}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 0mm;
            }
            *, *::before, *::after {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              background-color: #ffffff !important;
              width: 210mm !important;
              min-height: 297mm !important;
              font-family: inherit;
              overflow: visible !important;
            }
            .cv-print-isolated-sheet {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 auto !important;
              background: #ffffff !important;
              box-shadow: none !important;
              border: none !important;
              transform: none !important;
            }
            @media print {
              html, body {
                width: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="cv-print-isolated-sheet">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(printHtml);
    doc.close();

    const triggerPrint = () => {
      try {
        pri.focus();
        pri.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window print', err);
        fallbackWindowPrint();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 2500);
      }
    };

    // Wait for fonts & images inside the iframe to finish rendering
    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready
        .then(() => {
          setTimeout(triggerPrint, 300);
        })
        .catch(() => {
          setTimeout(triggerPrint, 450);
        });
    } else {
      setTimeout(triggerPrint, 450);
    }
  } catch (err) {
    console.error('Error initiating CV print iframe:', err);
    fallbackWindowPrint();
  }
};

