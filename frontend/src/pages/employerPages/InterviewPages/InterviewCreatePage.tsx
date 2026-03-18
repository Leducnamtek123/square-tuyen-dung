// @ts-nocheck
import { useTranslation } from 'react-i18next';

import InterviewCreateCard from '../../components/employers/InterviewCreateCard';

interface Props {
  [key: string]: any;
}



const InterviewCreatePage = () => {
    const { t } = useTranslation('employer');

    return (

        <InterviewCreateCard title={t('interviewCreateCard.title.scheduleOnlineInterview')} />

    );

};

export default InterviewCreatePage;
