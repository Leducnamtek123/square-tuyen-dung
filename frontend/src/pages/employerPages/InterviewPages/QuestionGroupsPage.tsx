// @ts-nocheck
import { useTranslation } from 'react-i18next';
import QuestionGroupsCard from '../../components/employers/QuestionGroupsCard';

interface Props {
  [key: string]: any;
}



const QuestionGroupsPage = () => {
    const { t } = useTranslation('employer');
    return (
        <QuestionGroupsCard title={t('sidebar.questionSets')} />
    );
};

export default QuestionGroupsPage;
