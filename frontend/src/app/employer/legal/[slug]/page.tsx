import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EmployerLayout from '@/layouts/EmployerLayout';
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
      title: `Chính sách & Quy định dành cho Nhà tuyển dụng | ${APP_NAME}`,
      description: `Quy định, chính sách bảo hành và thỏa thuận sử dụng dịch vụ tuyển dụng ${APP_NAME}.`,
    };
  }

  return {
    title: `${doc.title} | Nhà tuyển dụng ${APP_NAME}`,
    description: doc.subtitle || doc.summary,
    openGraph: {
      title: `${doc.title} | Nhà tuyển dụng ${APP_NAME}`,
      description: doc.subtitle || doc.summary,
      url: `https://infohr.vn/employer/${slug}.html`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(LEGAL_DOCUMENTS).map((slug) => ({
    slug,
  }));
}

export default async function EmployerLegalPolicyPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getLegalDocument(slug);

  if (!doc) {
    notFound();
  }

  return <LegalPolicyViewer slug={slug} portal="employer" />;
}

