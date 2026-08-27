import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DefaultLayout from '@/layouts/DefaultLayout';
import LegalPolicyViewer from '@/views/defaultPages/LegalPolicyPage/LegalPolicyViewer';
import { getLegalDocument, LEGAL_DOCUMENTS } from '@/views/defaultPages/LegalPolicyPage/legalData';
import { APP_NAME } from '@/configs/constants';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDocument(slug);

  if (!doc) {
    return {
      title: `Điều khoản & Chính sách | ${APP_NAME}`,
      description: `Văn bản pháp lý và chính sách hoạt động của ${APP_NAME}.`,
    };
  }

  return {
    title: `${doc.title} | ${APP_NAME}`,
    description: doc.subtitle || doc.summary,
    openGraph: {
      title: `${doc.title} | ${APP_NAME}`,
      description: doc.subtitle || doc.summary,
      url: `https://infohr.vn/${slug}.html`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(LEGAL_DOCUMENTS).map((slug) => ({
    slug,
  }));
}

export default async function LegalPolicyPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getLegalDocument(slug);

  if (!doc) {
    notFound();
  }

  return (
    <DefaultLayout>
      <LegalPolicyViewer slug={slug} portal="jobseeker" />
    </DefaultLayout>
  );
}
