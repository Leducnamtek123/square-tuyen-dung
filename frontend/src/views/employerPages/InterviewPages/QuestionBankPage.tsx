 'use client';
import { useTranslation } from 'react-i18next';
import QuestionBankCard from '../../components/employers/QuestionBankCard';

const QuestionBankPage = () => {
    const { t } = useTranslation('employer');
    return (
        <QuestionBankCard title={t('sidebar.questionBank')} />
    );
};

export default QuestionBankPage;
