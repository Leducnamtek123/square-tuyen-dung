import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ChatPage from '@/views/chatPages/ChatPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('chat');
}

export default function Page() {
  return <ChatPage />;
}
