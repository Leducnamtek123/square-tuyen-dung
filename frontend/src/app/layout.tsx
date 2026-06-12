import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';
import { Providers } from './providers';
import ClientAppRoot from './ClientAppRoot';
import './globals.css';           // Global CSS (Tailwind + design tokens)
import './app-overrides.css';     // App-level overrides

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});



export const metadata: Metadata = {
  title: {
    template: '%s | Square Tuyá»ƒn Dá»¥ng',
    default: 'Square | TÃ¬m viá»‡c nhanh, tuyá»ƒn dá»¥ng hiá»‡u quáº£',
  },
  description: 'Square - Ná»n táº£ng tuyá»ƒn dá»¥ng hÃ ng Ä‘áº§u Viá»‡t Nam. TÃ¬m kiáº¿m hÃ ng nghÃ¬n viá»‡c lÃ m phÃ¹ há»£p, káº¿t ná»‘i vá»›i cÃ¡c nhÃ  tuyá»ƒn dá»¥ng uy tÃ­n. á»¨ng tuyá»ƒn nhanh chÃ³ng, hiá»‡u quáº£',
  keywords: 'tÃ¬m viá»‡c, tuyá»ƒn dá»¥ng, viá»‡c lÃ m, á»©ng tuyá»ƒn, nhÃ  tuyá»ƒn dá»¥ng, CV, há»“ sÆ¡ xin viá»‡c, Square, tuyá»ƒn dá»¥ng Viá»‡t Nam',
  openGraph: {
    title: 'Square | TÃ¬m viá»‡c nhanh, tuyá»ƒn dá»¥ng hiá»‡u quáº£',
    description: 'Square - Ná»n táº£ng tuyá»ƒn dá»¥ng hÃ ng Ä‘áº§u Viá»‡t Nam. TÃ¬m kiáº¿m hÃ ng nghÃ¬n viá»‡c lÃ m phÃ¹ há»£p, káº¿t ná»‘i vá»›i cÃ¡c nhÃ  tuyá»ƒn dá»¥ng uy tÃ­n.',
    url: 'https://sqstudio.vn/',
    siteName: 'Square Tuyá»ƒn Dá»¥ng',
    locale: 'vi_VN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#1976d2',
};

export default function RootLayout({
  children,
}: {
  children: any;
}) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/square-icons/icon.svg" />
      </head>
      <body style={{ fontFamily: 'var(--font-be-vietnam-pro), sans-serif' }} suppressHydrationWarning>
        {/* Background Atmosphere Layer (Optimized) */}
        <div className="bg-atmosphere" />
        
        <ThemeRegistry>
          <Providers>
            <ClientAppRoot>
              {children}
            </ClientAppRoot>
          </Providers>
        </ThemeRegistry>
      </body>
    </html>
  );
}

