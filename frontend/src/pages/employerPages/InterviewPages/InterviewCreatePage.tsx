import { useTranslation } from 'react-i18next';
import InterviewCreateCard from '../../components/employers/InterviewCreateCard';

const InterviewCreatePage = () => {
    const { t } = useTranslation('employer');
    return (
        <InterviewCreateCard title={t('interviewCreateCard.title.scheduleOnlineInterview')} />
    );
};

export default InterviewCreatePage;
