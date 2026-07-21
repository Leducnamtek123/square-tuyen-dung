// Server Component - no client hooks needed, can export metadata
import type { Metadata } from 'next';
import ChatLayout from '@/layouts/ChatLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | InfoHR Tuyá»ƒn Dá»¥ng',
    default: 'Tin nháº¯n | InfoHR Tuyá»ƒn Dá»¥ng',
  },
};

export default function ChatSectionLayout({
  children,
}: {
  children: any;
}) {
  return <ChatLayout>{children}</ChatLayout>;
}

