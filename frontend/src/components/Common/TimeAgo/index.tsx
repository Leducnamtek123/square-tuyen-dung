import React from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from '@/configs/dayjs-config';

interface Props {
  date: string | number | Date;
  type?: 'fromNow' | 'format' | 'ago';
  format?: string;
}

const TimeAgo = ({ date, type = 'fromNow', format = 'DD/MM/YYYY HH:mm' }: Props) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language && !i18n.language.startsWith('vi')) ? 'en' : 'vi';

  const timeString = React.useMemo(() => {
    if (!date) return '';
    const dayjsDate = dayjs(date).locale(currentLang);
    return type === 'fromNow' ? dayjsDate.fromNow(true) : dayjsDate.format(format);
  }, [date, type, format, currentLang]);

  if (!date) return null;

  return <span>{timeString}</span>;
};

export default TimeAgo; 
