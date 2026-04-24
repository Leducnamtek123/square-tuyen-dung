// Server Component — no client hooks needed, can export metadata
import type { Metadata } from 'next';
import ChatLayout from '@/layouts/ChatLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | Square Tuyển Dụng',
    default: 'Tin nhắn | Square Tuyển Dụng',
  },
};

export default function ChatSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatLayout>{children}</ChatLayout>;
}
