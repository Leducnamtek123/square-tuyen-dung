import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AgentAssistantPage from '@/views/agentAssistantPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.agent-assistants');
}

export default function Page() {
  return <AgentAssistantPage portal="admin" />;
}

