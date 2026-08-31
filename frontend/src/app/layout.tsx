import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';
import { Providers } from './providers';
import ClientAppRoot from './ClientAppRoot';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://infohr.vn'),
  title: {
    template: '%s | InfoHR',
    default: 'InfoHR - Tìm việc nhanh, tuyển dụng hiệu quả',
  },
  description:
    'InfoHR - Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, kết nối với các nhà tuyển dụng uy tín. Ứng tuyển nhanh chóng, hiệu quả',
  keywords:
    'tìm việc, tuyển dụng, việc làm, ứng tuyển, nhà tuyển dụng, CV, hồ sơ xin việc, InfoHR, tuyển dụng Việt Nam',
  openGraph: {
    title: 'InfoHR - Tìm việc nhanh, tuyển dụng hiệu quả',
    description:
      'InfoHR - Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, kết nối với các nhà tuyển dụng uy tín. Ứng tuyển nhanh chóng, hiệu quả',
    url: 'https://infohr.vn',
    siteName: 'InfoHR',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://infohr.vn/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'InfoHR',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: any;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body style={{ fontFamily: 'var(--font-inter), var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }} suppressHydrationWarning>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-JCRQ029S1S"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-JCRQ029S1S');
            `,
          }}
        />
        <div className="bg-atmosphere" />
        <ThemeRegistry>
          <Providers>
            <ClientAppRoot>{children}</ClientAppRoot>
          </Providers>
        </ThemeRegistry>
      </body>
    </html>
  );
}
