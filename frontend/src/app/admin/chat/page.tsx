'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Tin nhắn' };

import AdminChatPage from '@/views/adminPages/ChatPage';

export default function Page() {
  return <AdminChatPage />;
}
