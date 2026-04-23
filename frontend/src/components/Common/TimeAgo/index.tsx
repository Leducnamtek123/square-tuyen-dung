import React from 'react';
import dayjs from '@/configs/dayjs-config';

interface Props {
  date: string | number | Date;
  type?: 'fromNow' | 'format' | 'ago';
  format?: string;
}

const TimeAgo = ({ date, type = 'fromNow', format = 'DD/MM/YYYY HH:mm' }: Props) => {
  const timeString = React.useMemo(() => {
    if (!date) return '';
    const dayjsDate = dayjs(date);
    return type === 'fromNow' ? dayjsDate.fromNow(true) : dayjsDate.format(format);
  }, [date, type, format]);

  if (!date) return null;

  return <span>{timeString}</span>;
};

export default TimeAgo; 
