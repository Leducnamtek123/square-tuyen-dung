import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';
import { Providers } from './providers';
import ClientAppRoot from './ClientAppRoot';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
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
    'tìm việc, tuyển dụng, việc làm, ứng tuyển, nhà tuyển dụng, CV, hồ sơ xin việc, InfoHR, tuyển dụng Việt Nam, phỏng vấn AI',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://infohr.vn',
    languages: {
      'vi-VN': 'https://infohr.vn',
      'en-US': 'https://infohr.vn',
      'x-default': 'https://infohr.vn',
    },
  },
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
        alt: 'InfoHR - Nền tảng tuyển dụng hàng đầu Việt Nam',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfoHR - Tìm việc nhanh, tuyển dụng hiệu quả',
    description:
      'InfoHR - Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, kết nối với các nhà tuyển dụng uy tín.',
    images: ['https://infohr.vn/android-chrome-512x512.png'],
    creator: '@infohr_vn',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
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

// Structured Data (JSON-LD) for Schema.org SEO & GEO AI Crawlers
const rootJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://infohr.vn/#website',
      url: 'https://infohr.vn',
      name: 'InfoHR',
      alternateName: ['InfoHR Tuyển Dụng', 'InfoHR Vietnam'],
      description:
        'InfoHR - Nền tảng tuyển dụng và tìm kiếm việc làm chất lượng cao hàng đầu Việt Nam. Kết nối ứng viên tài năng với các nhà tuyển dụng uy tín.',
      inLanguage: 'vi',
      publisher: {
        '@id': 'https://infohr.vn/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://infohr.vn/viec-lam?kw={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://infohr.vn/#organization',
      name: 'InfoHR',
      alternateName: 'InfoHR Tuyển Dụng',
      legalName: 'Công ty Cổ phần Công nghệ InfoHR Việt Nam',
      url: 'https://infohr.vn',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://infohr.vn/#logo',
        url: 'https://infohr.vn/android-chrome-512x512.png',
        contentUrl: 'https://infohr.vn/android-chrome-512x512.png',
        width: 512,
        height: 512,
        caption: 'InfoHR Logo',
      },
      image: 'https://infohr.vn/android-chrome-512x512.png',
      description:
        'Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, kết nối với các nhà tuyển dụng uy tín, hỗ trợ phỏng vấn AI AILA.',
      inLanguage: 'vi',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Tòa nhà InfoHR, Cầu Giấy',
        addressLocality: 'Hà Nội',
        addressRegion: 'Hà Nội',
        postalCode: '100000',
        addressCountry: 'VN',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+84-24-7300-1234',
        contactType: 'customer service',
        areaServed: 'VN',
        availableLanguage: ['Vietnamese', 'English'],
      },
      sameAs: [
        'https://www.facebook.com/infohr.vn',
        'https://www.linkedin.com/company/infohr-vietnam',
        'https://twitter.com/infohr_vn',
        'https://www.youtube.com/@infohr_vn',
      ],
      knowsAbout: [
        'Tuyển dụng nhân sự',
        'Tìm việc làm',
        'Phỏng vấn Voice AI',
        'AI Interview',
        'Tạo CV trực tuyến',
        'Quản trị nhân sự HRM',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Dịch vụ tuyển dụng và việc làm InfoHR',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Tìm việc làm & Ứng tuyển trực tuyến',
              description: 'Hàng ngàn tin tuyển dụng việc làm chất lượng cao trên toàn quốc',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Phỏng vấn AI Voice AILA',
              description: 'Luyện phỏng vấn và phỏng vấn sơ loại ứng viên bằng trí tuệ nhân tạo thời gian thực',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Đăng tin tuyển dụng doanh nghiệp',
              description: 'Tiếp cận hàng triệu ứng viên tiềm năng và tối ưu hóa quy trình tuyển dụng',
            },
          },
        ],
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://s3.infohr.vn" />
        <link rel="dns-prefetch" href="https://s3.infohr.vn" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="alternate" type="text/plain" href="/llms.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(rootJsonLd),
          }}
        />
      </head>
      <body style={{ fontFamily: 'var(--font-inter), var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }} suppressHydrationWarning>
        <noscript>
          <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px' }}>
            InfoHR - Nền tảng tuyển dụng thông minh &amp; Phỏng vấn AI. Vui lòng bật JavaScript trên trình duyệt của bạn để trải nghiệm tốt nhất.
          </div>
        </noscript>
        <Script
          id="google-consent"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'wait_for_update': 500
              });
            `,
          }}
        />
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-JCRQ029S1S"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
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
