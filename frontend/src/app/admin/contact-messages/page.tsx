import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import { ContactMessagesPage } from '@/views/adminPages';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.contactMessages');
}

export default function Page() {
  return <ContactMessagesPage />;
}