import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import JobDetailClientPage from './ClientPage';
import type { Company } from '@/types/models';
import type { JobPost } from '@/types/models';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await serverFetch<JobPost & { company?: Company; city?: { name?: string } }>(`job/web/job-posts/${slug}/`);

  if (!job) {
    return {
      title: 'Việc làm | InfoHR Tuyển Dụng',
      description: 'Chi tiết việc làm trên InfoHR Tuyển Dụng',
    };
  }

  const jobTitle = job.jobName || 'Việc làm';
  const companyName = job.company?.companyName || '';
  const location = job.city?.name || '';
  const salary = job.salaryMin && job.salaryMax
    ? `${job.salaryMin} - ${job.salaryMax} triệu`
    : 'Thỏa thuận';

  const title = companyName
    ? `${jobTitle} - ${companyName} | InfoHR`
    : `${jobTitle} | InfoHR`;

  const description = [
    jobTitle,
    companyName && `tại ${companyName}`,
    location && `ở ${location}`,
    `Mức lương: ${salary}`,
    'Ứng tuyển ngay trên InfoHR Tuyển Dụng.',
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
      siteName: 'InfoHR Tuyển Dụng',
      locale: 'vi_VN',
      ...(job.company?.companyImageUrl && {
        images: [{ url: job.company.companyImageUrl }],
      }),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const job = await serverFetch<JobPost & { company?: Company; city?: { name?: string }; location?: { address?: string; city?: { name?: string } } }>(`job/web/job-posts/${slug}/`);

  const jsonLd = job
    ? {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.jobName || 'Việc làm',
        description: job.jobDescription || job.jobRequirement || `${job.jobName} tại ${job.company?.companyName || 'Doanh nghiệp tuyển dụng'}`,
        datePosted: job.createAt || new Date().toISOString(),
        validThrough: job.deadline ? new Date(job.deadline).toISOString() : undefined,
        employmentType: 'FULL_TIME',
        hiringOrganization: {
          '@type': 'Organization',
          name: job.company?.companyName || 'Doanh nghiệp tuyển dụng',
          sameAs: job.company?.websiteUrl || undefined,
          logo: job.company?.companyImageUrl || job.company?.logoUrl || undefined,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.location?.city?.name || job.city?.name || 'Việt Nam',
            streetAddress: job.location?.address || undefined,
            addressCountry: 'VN',
          },
        },
        baseSalary:
          job.salaryMin || job.salaryMax
            ? {
                '@type': 'MonetaryAmount',
                currency: 'VND',
                value: {
                  '@type': 'QuantitativeValue',
                  minValue: job.salaryMin ? job.salaryMin * 1000000 : undefined,
                  maxValue: job.salaryMax ? job.salaryMax * 1000000 : undefined,
                  unitText: 'MONTH',
                },
              }
            : undefined,
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
      <JobDetailClientPage />
    </>
  );
}
