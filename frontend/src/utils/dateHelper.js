/*

MyJob Recruitment System - Part of MyJob Platform



Author: Bui Khanh Huy

Email: khuy220@gmail.com

/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import calendar from 'dayjs/plugin/calendar';

dayjs.extend(calendar);
dayjs.locale('vi');

export const formatMessageDate = (timestamp) => {
  return dayjs(timestamp).calendar(null, {
    sameDay: '[Hôm nay lúc] HH:mm', // [Hôm nay] LT
    lastDay: '[Hôm qua lúc] HH:mm', // [Hôm qua] LT
    lastWeek: 'DD/MM/YYYY HH:mm', // DD/MM/YYYY LT
    sameElse: 'DD/MM/YYYY HH:mm', // DD/MM/YYYY LT
  });
};
