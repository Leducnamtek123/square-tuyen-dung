import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import CompanyDetailClientPage from './ClientPage';
import type { Company } from '@/types/models';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await serverFetch<Company>(`info/web/companies/${slug}/`);

  if (!company) {
    return {
      title: 'Công ty | InfoHR Tuyển Dụng',
      description: 'Thông tin công ty trên InfoHR Tuyển Dụng',
    };
  }

  const companyName = company.companyName || 'Công ty';
  const fieldOperation = company.fieldOperation || '';
  const employeeSize = company.employeeSize || '';

  const title = `${companyName} - Tuyển dụng & Việc làm | InfoHR`;

  const description = [
    `${companyName}`,
    fieldOperation && `Lĩnh vực: ${fieldOperation}`,
    employeeSize && `Quy mô: ${employeeSize} nhân viên`,
    'Xem thông tin công ty và các vị trí đang tuyển trên InfoHR Tuyển Dụng.',
  ]
    .filter(Boolean)
    .join('. ');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/cong-ty/${slug}`,
      siteName: 'InfoHR Tuyển Dụng',
      locale: 'vi_VN',
      ...(company.companyImageUrl && {
        images: [{ url: company.companyImageUrl }],
      }),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const company = await serverFetch<Company>(`info/web/companies/${slug}/`);

  const jsonLd = company
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: company.companyName || 'Doanh nghiệp',
        url: `https://infohr.vn/cong-ty/${slug}`,
        logo: company.companyImageUrl || company.logoUrl || undefined,
        description: company.description || undefined,
        sameAs: company.websiteUrl || undefined,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CompanyDetailClientPage />
    </>
  );
}
