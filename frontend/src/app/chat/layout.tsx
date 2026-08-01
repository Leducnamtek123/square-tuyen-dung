// Server Component - no client hooks needed, can export metadata
import type { Metadata } from 'next';
import ChatLayout from '@/layouts/ChatLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | InfoHR Tuyển Dụng',
    default: 'Tin nhắn | InfoHR Tuyển Dụng',
  },
};

export default function ChatSectionLayout({
  children,
}: {
  children: any;
}) {
  return <ChatLayout>{children}</ChatLayout>;
}

