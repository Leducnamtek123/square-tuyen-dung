import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import CompanyDetailClientPage from './ClientPage';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await serverFetch<import('@/types/models').Company>(`info/web/companies/${slug}/`);

  if (!company) {
    return {
      title: 'Công ty | Square Tuyển Dụng',
      description: 'Thông tin công ty trên Square Tuyển Dụng',
    };
  }

  const companyName = company.companyName || 'Công ty';
  const fieldOperation = company.fieldOperation || '';
  const employeeSize = company.employeeSize || '';

  const title = `${companyName} - Tuyển dụng & Việc làm | Square`;

  const description = [
    `${companyName}`,
    fieldOperation && `Lĩnh vực: ${fieldOperation}`,
    employeeSize && `Quy mô: ${employeeSize} nhân viên`,
    'Xem thông tin công ty và các vị trí đang tuyển trên Square Tuyển Dụng.',
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
      siteName: 'Square Tuyển Dụng',
      locale: 'vi_VN',
      ...(company.companyImageUrl && {
        images: [{ url: company.companyImageUrl }],
      }),
    },
  };
}

export default function Page() {
  return <CompanyDetailClientPage />;
}
