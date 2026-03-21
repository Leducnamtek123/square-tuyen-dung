import os

FILE_PATH = "c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/components/interviewAi/InterviewAgentView.tsx"

REPLACEMENTS = {
    'import { cn } from "@/lib/utils";': 'import { cn } from "@/lib/utils";\nimport { useTranslation } from "react-i18next";',
    'const InterviewAgentView = ({ onDisconnect, sessionInfo }: InterviewAgentViewProps) => {': 'const InterviewAgentView = ({ onDisconnect, sessionInfo }: InterviewAgentViewProps) => {\n  const { t } = useTranslation("interview");',
    '{sessionInfo?.jobName || "Technical Interview"}': '{sessionInfo?.jobName || t("agentView.technicalInterview")}',
    'Live Session | {sessionInfo?.candidateName || "Candidate"}': 'Live Session | {sessionInfo?.candidateName || t("agentView.candidate")}',
    "state === 'speaking' ? 'Agent is speaking' :": "state === 'speaking' ? t('agentView.agentSpeaking') :",
    "state === 'thinking' ? 'Agent is thinking' :": "state === 'thinking' ? t('agentView.agentThinking') :",
    "state === 'listening' ? 'Listening...' : 'Ready'": "state === 'listening' ? t('agentView.listening') : t('agentView.ready')",
    ">Transcript<": ">{t('agentView.transcript')}<"
}

def apply_replacements():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    for old, new in REPLACEMENTS.items():
        content = content.replace(old, new)
    
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {FILE_PATH} successfully.")

if __name__ == '__main__':
    apply_replacements()
