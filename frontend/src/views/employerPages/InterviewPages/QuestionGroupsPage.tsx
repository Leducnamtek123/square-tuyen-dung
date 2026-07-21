 'use client';
import { useTranslation } from 'react-i18next';
import QuestionGroupsCard from '../../components/employers/QuestionGroupsCard';

const QuestionGroupsPage = () => {
    const { t } = useTranslation('employer');
    return (
        <QuestionGroupsCard title={t('sidebar.questionSets')} />
    );
};

export default QuestionGroupsPage;
