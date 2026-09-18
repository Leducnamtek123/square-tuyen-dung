import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MagicIcon from '@mui/icons-material/AutoAwesome';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { FilterSystemConfig } from '../types';

export const savedResumeFilterConfig: FilterSystemConfig = {
  id: 'saved-resume-filters',
  title: 'BỘ LỌC HỒ SƠ ĐÃ LƯU',
  pageKey: 'page',
  pageSizeKey: 'pageSize',
  primaryFieldKey: 'cityId',
  syncWithUrl: true,
  ignoredCountKeys: ['page', 'pageSize', 'kw'],
  defaultValues: {
    kw: '',
    salaryMax: '',
    experienceId: '',
    cityId: '',
    page: 1,
    pageSize: 10,
  },

  fields: [
    {
      key: 'kw',
      label: 'TỪ KHÓA',
      type: 'TEXT',
      placeholder: 'Nhập tiêu đề tin hoặc tên ứng viên...',
      icon: SearchIcon,
    },
    {
      key: 'salaryMax',
      label: 'MỨC LƯƠNG TỐI ĐA',
      type: 'NUMBER',
      placeholder: 'Nhập mức lương tối đa (VNĐ)...',
      icon: AttachMoneyIcon,
      formatLabel: (val) => (val ? `${Number(val).toLocaleString('vi-VN')} VNĐ` : ''),
    },
    {
      key: 'experienceId',
      label: 'KINH NGHIỆM',
      type: 'SELECT',
      placeholder: 'Chọn thời gian kinh nghiệm',
      icon: MagicIcon,
      getOptions: (_, allConfig) => allConfig?.experienceOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const dictVal = allConfig?.experienceDict?.[val];
        if (dictVal) return String(dictVal);
        const match = options?.find((o) => String(o.id) === String(val) || String(o.value) === String(val));
        return match ? match.name || match.label || String(val) : String(val);
      },
    },
    {
      key: 'cityId',
      label: 'TỈNH / THÀNH PHỐ',
      type: 'SELECT',
      placeholder: 'Chọn tỉnh thành',
      icon: LocationOnIcon,
      getOptions: (_, allConfig) => allConfig?.cityOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const dictVal = allConfig?.cityDict?.[val];
        if (dictVal) return String(dictVal);
        const match = options?.find((o) => String(o.id) === String(val) || String(o.value) === String(val));
        return match ? match.name || match.label || String(val) : String(val);
      },
    },
  ],
};
