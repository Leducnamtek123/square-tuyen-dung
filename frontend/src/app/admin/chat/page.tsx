import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ChatPage from '@/views/adminPages/ChatPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.chat');
}

export default function Page() {
  return <ChatPage />;
}
