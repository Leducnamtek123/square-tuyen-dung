import React from 'react';
import dayjs from '../../configs/dayjs-config';

interface Props {
  date: string | number | Date | any;
  type?: 'fromNow' | 'format';
  format?: string;
  [key: string]: any;
}

const TimeAgo = ({ date, type = 'fromNow', format = 'DD/MM/YYYY HH:mm' }: Props) => {
  const [timeString, setTimeString] = React.useState('');

  React.useEffect(() => {
    if (!date) return;

    const updateTime = () => {
      const dayjsDate = dayjs(date);
      if (type === 'fromNow') {
        setTimeString(dayjsDate.fromNow(true));
      } else {
        setTimeString(dayjsDate.format(format));
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);

    return () => clearInterval(timer);
  }, [date, type, format]);

  if (!date) return null;

  return <span>{timeString}</span>;
};

export default TimeAgo; 
