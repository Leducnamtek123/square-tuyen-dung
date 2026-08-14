import SearchIcon from '@mui/icons-material/Search';
import BriefcaseIcon from '@mui/icons-material/WorkHistory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Groups';
import MagicIcon from '@mui/icons-material/AutoAwesome';
import BuildingIcon from '@mui/icons-material/Business';
import WorkerIcon from '@mui/icons-material/Engineering';
import GenderIcon from '@mui/icons-material/Transgender';
import type { FilterSystemConfig } from '../types';

export const jobPostFilterConfig: FilterSystemConfig = {
  id: 'job-post-filters',
  title: 'BỘ LỌC TIN TUYỂN DỤNG',
  pageKey: 'page',
  pageSizeKey: 'pageSize',
  primaryFieldKey: 'statusId',
  syncWithUrl: true,
  ignoredCountKeys: ['page', 'pageSize', 'kw'],
  defaultValues: {
    kw: '',
    statusId: '',
    isUrgent: '',
    careerId: '',
    cityId: '',
    positionId: '',
    experienceId: '',
    typeOfWorkplaceId: '',
    jobTypeId: '',
    genderId: '',
    page: 1,
    pageSize: 10,
  },
  fields: [
    {
      key: 'kw',
      label: 'TỪ KHÓA TÌM KIẾM',
      type: 'TEXT',
      placeholder: 'Nhập tên công việc...',
      icon: SearchIcon,
    },
    {
      key: 'statusId',
      label: 'TRẠNG THÁI',
      type: 'SELECT',
      placeholder: 'Tất cả trạng thái',
      icon: BriefcaseIcon,
      getOptions: (_, allConfig) => allConfig?.jobPostStatusOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const match = options?.find((o) => String(o.id) === String(val) || String(o.value) === String(val));
        return match ? match.name || match.label || String(val) : String(val);
      },
    },
    {
      key: 'isUrgent',
      label: 'ĐỘ KHẨN CẤP',
      type: 'SELECT',
      placeholder: 'Tất cả độ khẩn cấp',
      icon: MagicIcon,
      options: [
        { id: 'true', name: 'Tuyển gấp' },
        { id: 'false', name: 'Bình thường' },
        { id: '1', name: 'Tuyển gấp' },
        { id: '2', name: 'Bình thường' },
      ],
      formatLabel: (val) => {
        if (val === true || val === 'true' || val === 1 || val === '1') return 'Tuyển gấp';
        if (val === false || val === 'false' || val === 2 || val === '2') return 'Bình thường';
        return '';
      },
    },

    {
      key: 'careerId',
      label: 'NGÀNH NGHỀ',
      type: 'SELECT',
      placeholder: 'Tất cả ngành nghề',
      icon: BriefcaseIcon,
      getOptions: (_, allConfig) => allConfig?.careerOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const dictVal = allConfig?.careerDict?.[val];
        if (dictVal) return String(dictVal);
        const match = options?.find((o) => String(o.id) === String(val) || String(o.value) === String(val));
        return match ? match.name || match.label || String(val) : String(val);
      },
    },
    {
      key: 'cityId',
      label: 'TỈNH / THÀNH PHỐ',
      type: 'SELECT',
      placeholder: 'Tất cả tỉnh thành',
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
    {
      key: 'positionId',
      label: 'CẤP BẬC',
      type: 'SELECT',
      placeholder: 'Cấp bậc',
      icon: GroupIcon,
      getOptions: (_, allConfig) => allConfig?.positionOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const dictVal = allConfig?.positionDict?.[val];
        if (dictVal) return String(dictVal);
        const match = options?.find((o) => String(o.id) === String(val) || String(o.value) === String(val));
        return match ? match.name || match.label || String(val) : String(val);
      },
    },
    {
      key: 'experienceId',
      label: 'KINH NGHIỆM',
      type: 'SELECT',
      placeholder: 'Kinh nghiệm',
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
      key: 'typeOfWorkplaceId',
      label: 'NƠI LÀM VIỆC',
      type: 'SELECT',
      placeholder: 'Hình thức LV',
      icon: BuildingIcon,
      getOptions: (_, allConfig) => allConfig?.typeOfWorkplaceOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const dictVal = allConfig?.typeOfWorkplaceDict?.[val];
        if (dictVal) return String(dictVal);
        const match = options?.find((o) => String(o.id) === String(val) || String(o.value) === String(val));
        return match ? match.name || match.label || String(val) : String(val);
      },
    },
    {
      key: 'jobTypeId',
      label: 'LOẠI HÌNH LÀM VIỆC',
      type: 'SELECT',
      placeholder: 'Loại hình LV',
      icon: WorkerIcon,
      getOptions: (_, allConfig) => allConfig?.jobTypeOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const dictVal = allConfig?.jobTypeDict?.[val];
        if (dictVal) return String(dictVal);
        const match = options?.find((o) => String(o.id) === String(val) || String(o.value) === String(val));
        return match ? match.name || match.label || String(val) : String(val);
      },
    },
    {
      key: 'genderId',
      label: 'GIỚI TÍNH YÊU CẦU',
      type: 'SELECT',
      placeholder: 'Giới tính',
      icon: GenderIcon,
      getOptions: (_, allConfig) => allConfig?.genderOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const dictVal = allConfig?.genderDict?.[val];
        if (dictVal) return String(dictVal);
        const match = options?.find((o) => String(o.id) === String(val) || String(o.value) === String(val));
        return match ? match.name || match.label || String(val) : String(val);
      },
    },
  ],
};
