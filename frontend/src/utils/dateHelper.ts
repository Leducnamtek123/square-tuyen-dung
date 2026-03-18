import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import calendar from 'dayjs/plugin/calendar';

dayjs.extend(calendar);
dayjs.locale('vi');

export const formatMessageDate = (timestamp: string | number | Date): string => {
  return dayjs(timestamp).calendar(null, {
    sameDay: '[Hôm nay lúc] HH:mm', // [Hôm nay] LT
    lastDay: '[Hôm qua lúc] HH:mm', // [Hôm qua] LT
    lastWeek: 'DD/MM/YYYY HH:mm', // DD/MM/YYYY LT
    sameElse: 'DD/MM/YYYY HH:mm', // DD/MM/YYYY LT
  });
};
