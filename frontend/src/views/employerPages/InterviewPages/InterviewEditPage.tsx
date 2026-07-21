'use client';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import InterviewCreateCard from '../../components/employers/InterviewCreateCard';

const InterviewEditPage = () => {
    const { t } = useTranslation('employer');
    const params = useParams();
    const id = params?.id as string;

    return (
        <InterviewCreateCard 
            title={t('interviewListCard.editInterview', { ns: 'interview' })} 
            sessionId={id} 
        />
    );
};

export default InterviewEditPage;
