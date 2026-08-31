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

/** Standard date formatter (Default DD/MM/YYYY) */
export const formatDate = (date?: string | number | Date | null, format = 'DD/MM/YYYY'): string => {
  if (!date) return '';
  const d = dayjs(date);
  if (!d.isValid()) return '';
  return d.format(format);
};

/** Standard date-time formatter (Default DD/MM/YYYY HH:mm) */
export const formatDateTime = (date?: string | number | Date | null, format = 'DD/MM/YYYY HH:mm'): string => {
  if (!date) return '';
  const d = dayjs(date);
  if (!d.isValid()) return '';
  return d.format(format);
};

/** Standard time formatter (Default HH:mm:ss) */
export const formatTime = (timestamp?: string | number | Date | null, locale = 'vi-VN'): string => {
  if (!timestamp) return '';
  if (typeof timestamp === 'number') {
    // If timestamp is milliseconds or seconds
    const d = dayjs(timestamp > 1e11 ? timestamp : timestamp * 1000);
    return d.isValid() ? d.format('HH:mm:ss') : '';
  }
  const d = dayjs(timestamp);
  return d.isValid() ? d.format('HH:mm') : '';
};

/** Formats seconds into MM:SS display timer string */
export const formatTimer = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/** Formats date into YYYY-MM-DD string for Backend API payload */
export const formatDateForApi = (value: Date | string | null | undefined): string | null | undefined => {
  if (!value) return value;
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD') : undefined;
};

