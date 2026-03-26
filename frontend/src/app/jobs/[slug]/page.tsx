import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import JobDetailClientPage from './ClientPage';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await serverFetch<any>(`job/web/job-posts/${slug}/`);

  if (!job) {
    return {
      title: 'Việc làm | Square Tuyển Dụng',
      description: 'Chi tiết việc làm trên Square Tuyển Dụng',
    };
  }

  const jobTitle = job.jobName || job.job_name || 'Việc làm';
  const companyName = job.company?.companyName || job.company?.company_name || '';
  const location = job.city?.name || '';
  const salary = job.salaryMin && job.salaryMax
    ? `${job.salaryMin} - ${job.salaryMax} triệu`
    : 'Thỏa thuận';

  const title = companyName
    ? `${jobTitle} - ${companyName} | Square`
    : `${jobTitle} | Square`;

  const description = [
    jobTitle,
    companyName && `tại ${companyName}`,
    location && `ở ${location}`,
    `Mức lương: ${salary}`,
    'Ứng tuyển ngay trên Square Tuyển Dụng.',
  ]
    .filter(Boolean)
    .join('. ');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/viec-lam/${slug}`,
      siteName: 'Square Tuyển Dụng',
      locale: 'vi_VN',
      ...(job.company?.companyImageUrl && {
        images: [{ url: job.company.companyImageUrl }],
      }),
    },
  };
}

export default function Page() {
  return <JobDetailClientPage />;
}
