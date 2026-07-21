import AgentAssistantPage from '@/views/agentAssistantPage';

export const metadata = {
  title: 'Agent Assistants',
  description: 'Internal employer agent assistants.',
};

export default function Page() {
  return <AgentAssistantPage portal="employer" />;
}

