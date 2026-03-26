'use client';

import ChatLayout from '@/layouts/ChatLayout';

export default function ChatSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatLayout>{children}</ChatLayout>;
}
