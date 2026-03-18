// @ts-nocheck
import { useTranslation } from 'react-i18next';
import QuestionBankCard from '../../components/employers/QuestionBankCard';

interface Props {
  [key: string]: any;
}



const QuestionBankPage = () => {
    const { t } = useTranslation('employer');
    return (
        <QuestionBankCard title={t('sidebar.questionBank')} />
    );
};

export default QuestionBankPage;
