import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DefaultLayout from '@/layouts/DefaultLayout';
import LegalPolicyViewer from '@/views/defaultPages/LegalPolicyPage/LegalPolicyViewer';
import { getLegalDocument, LEGAL_DOCUMENTS } from '@/views/defaultPages/LegalPolicyPage/legalData';
import { APP_NAME } from '@/configs/constants';

interface PageProps {
  params: Promise<{
    slug?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const cleanSlug = typeof rawSlug === 'string' ? rawSlug.replace(/\.html$/i, '') : '';
  const doc = getLegalDocument(cleanSlug);

  if (!doc) {
    return {
      title: 'Điều khoản & Chính sách',
      description: `Văn bản pháp lý và chính sách hoạt động của ${APP_NAME}.`,
    };
  }

  const canonicalUrl = `https://infohr.vn/${cleanSlug}.html`;
  const description = doc.subtitle || doc.summary;

  return {
    title: doc.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${doc.title} | ${APP_NAME}`,
      description,
      url: canonicalUrl,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(LEGAL_DOCUMENTS).map((slug) => ({
    slug,
  }));
}

export default async function LegalHtmlPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const cleanSlug = typeof rawSlug === 'string' ? rawSlug.replace(/\.html$/i, '') : '';
  const doc = getLegalDocument(cleanSlug);

  if (!doc) {
    notFound();
  }

  return (
    <DefaultLayout>
      <LegalPolicyViewer slug={cleanSlug} portal="jobseeker" />
    </DefaultLayout>
  );
}
