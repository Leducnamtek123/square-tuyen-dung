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
  if (!slug || slug === ':slug') {
    return {
      title: 'Tuyển dụng việc làm hấp dẫn',
      description: 'Khám phá cơ hội việc làm lương cao, đãi ngộ tốt và ứng tuyển nhanh chóng trên InfoHR.',
    };
  }
  const job = await serverFetch<JobPost & { company?: Company; city?: { name?: string } }>(`job/web/job-posts/${slug}/`);

  const canonicalUrl = `https://infohr.vn/viec-lam/${slug}`;

  if (!job) {
    return {
      title: 'Tuyển dụng việc làm hấp dẫn',
      description: 'Khám phá cơ hội việc làm lương cao, đãi ngộ tốt và ứng tuyển nhanh chóng trên InfoHR.',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const cleanJobTitle = (job.jobName || 'Việc làm').replace(/\s*\|\s*InfoHR\s*$/i, '').trim();
  const companyName = (job.company?.companyName || '').trim();
  const location = job.city?.name || '';
  const salary = job.salaryMin && job.salaryMax
    ? `${job.salaryMin} - ${job.salaryMax} triệu`
    : 'Thỏa thuận';

  const title = companyName
    ? `${cleanJobTitle} - ${companyName}`
    : `${cleanJobTitle} tuyển dụng`;

  const rawDescription = [
    cleanJobTitle,
    companyName && `tại ${companyName}`,
    location && `ở ${location}`,
    `Mức lương: ${salary}`,
    'Ứng tuyển ngay trên InfoHR.',
  ]
    .filter(Boolean)
    .join('. ');

  const description = rawDescription.length > 155
    ? rawDescription.slice(0, 152) + '...'
    : rawDescription;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      siteName: 'InfoHR',
      locale: 'vi_VN',
      ...(job.company?.companyImageUrl && {
        images: [{ url: job.company.companyImageUrl, alt: title }],
      }),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!slug || slug === ':slug') {
    return <JobDetailClientPage />;
  }
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
      <JobDetailClientPage initialJob={job} />
    </>
  );
}
