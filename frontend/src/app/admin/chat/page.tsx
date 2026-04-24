import type { Metadata } from 'next';
import ChatPage from '@/views/adminPages/ChatPage';

export const metadata: Metadata = { title: 'Chat' };

export default function Page() {
  return <ChatPage />;
}
