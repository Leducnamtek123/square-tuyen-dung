import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import calendar from 'dayjs/plugin/calendar';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(calendar);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.locale('vi');

export const formatMessageDate = (timestamp: string | number | Date): string => {
  return dayjs(timestamp).calendar(null, {
    sameDay: '[Hôm nay lúc] HH:mm',
    lastDay: '[Hôm qua lúc] HH:mm',
    lastWeek: 'DD/MM/YYYY HH:mm',
    sameElse: 'DD/MM/YYYY HH:mm',
  });
};

export const formatMessageTime = (timestamp: string | number | Date | null | undefined): string => {
  if (!timestamp) return '';
  const d = dayjs(timestamp);
  if (!d.isValid()) return '';
  if (d.isToday()) {
    return d.format('HH:mm');
  }
  if (d.isYesterday()) {
    return 'Hôm qua';
  }
  if (d.year() === dayjs().year()) {
    return d.format('DD/MM');
  }
  return d.format('DD/MM/YYYY');
};

export const formatDateDivider = (timestamp: string | number | Date | null | undefined): string => {
  if (!timestamp) return '';
  const d = dayjs(timestamp);
  if (!d.isValid()) return '';
  if (d.isToday()) {
    return 'Hôm nay';
  }
  if (d.isYesterday()) {
    return 'Hôm qua';
  }
  return d.format('DD [Tháng] MM, YYYY');
};

