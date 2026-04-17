import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from 'next/font/google';
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

const displayFont = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-pj-sans',
});

export const metadata: Metadata = {
  title: 'Square | Tìm việc nhanh, tuyển dụng hiệu quả',
  description: 'Square - Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, kết nối với các nhà tuyển dụng uy tín. Ứng tuyển nhanh chóng, hiệu quả',
  keywords: 'tìm việc, tuyển dụng, việc làm, ứng tuyển, nhà tuyển dụng, CV, hồ sơ xin việc, Square, tuyển dụng Việt Nam',
  openGraph: {
    title: 'Square | Tìm việc nhanh, tuyển dụng hiệu quả',
    description: 'Square - Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, kết nối với các nhà tuyển dụng uy tín.',
    url: 'https://sqstudio.vn/',
    siteName: 'Square Tuyển Dụng',
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
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${displayFont.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/square-icons/icon.svg" />
      </head>
      <body style={{ fontFamily: 'var(--font-be-vietnam-pro), sans-serif' }} suppressHydrationWarning>
        {/* Background Atmosphere Layers */}
        <div className="bg-atmosphere" />
        <div className="bg-noise" />
        
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

