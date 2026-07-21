import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';
import { Providers } from './providers';
import ClientAppRoot from './ClientAppRoot';
import './globals.css';
import './app-overrides.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  title: {
    template: '%s | InfoHR Tuyển Dụng',
    default: 'InfoHR | Tìm việc nhanh, tuyển dụng hiệu quả',
  },
  description:
    'InfoHR - Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, kết nối với các nhà tuyển dụng uy tín. Ứng tuyển nhanh chóng, hiệu quả',
  keywords:
    'tìm việc, tuyển dụng, việc làm, ứng tuyển, nhà tuyển dụng, CV, hồ sơ xin việc, InfoHR, tuyển dụng Việt Nam',
  openGraph: {
    title: 'InfoHR | Tìm việc nhanh, tuyển dụng hiệu quả',
    description:
      'InfoHR - Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, kết nối với các nhà tuyển dụng uy tín.',
    url: 'https://sqstudio.vn/',
    siteName: 'InfoHR Tuyển Dụng',
    locale: 'vi_VN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: any;
}) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/infohr-icons/logo-brand.png" />
      </head>
      <body style={{ fontFamily: 'var(--font-be-vietnam-pro), sans-serif' }} suppressHydrationWarning>
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
