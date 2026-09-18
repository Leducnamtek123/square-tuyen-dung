import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import { CVGalleryPage } from '@/views/cvBuilderPages/CVGalleryPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('cv-templates');
}

import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/ung-vien/trang-tri-cv');
}
