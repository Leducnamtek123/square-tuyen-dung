import type { Metadata, Viewport } from 'next';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';
import { Providers } from './providers';
import ClientAppRoot from './ClientAppRoot';
import './globals.css';           // Global CSS (Tailwind + design tokens)
import './app-overrides.css';     // App-level overrides

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
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/square-icons/icon.svg" />
      </head>
      <body suppressHydrationWarning>
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
