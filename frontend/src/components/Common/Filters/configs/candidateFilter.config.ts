import BriefcaseIcon from '@mui/icons-material/WorkHistory';
import MagicIcon from '@mui/icons-material/AutoAwesome';
import GroupIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import BuildingIcon from '@mui/icons-material/Business';
import WorkerIcon from '@mui/icons-material/Engineering';
import GenderIcon from '@mui/icons-material/Transgender';
import FamilyIcon from '@mui/icons-material/FamilyRestroom';
import type { FilterSystemConfig } from '../types';

export const candidateFilterConfig: FilterSystemConfig = {
  id: 'candidate-search-filters',
  title: 'BỘ LỌC NÂNG CAO',
  pageKey: 'page',
  pageSizeKey: 'pageSize',
  primaryFieldKey: 'cityId',
  syncWithUrl: true,
  ignoredCountKeys: ['page', 'pageSize', 'kw', 'cityId'],
  defaultValues: {

    kw: '',
    cityId: '',
    careerId: '',
    experienceId: '',
    positionId: '',
    academicLevelId: '',
    typeOfWorkplaceId: '',
    jobTypeId: '',
    genderId: '',
    maritalStatusId: '',
    page: 1,
    pageSize: 6,
  },
  fields: [
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
      key: 'experienceId',
      label: 'KINH NGHIỆM',
      type: 'SELECT',
      placeholder: 'Thời gian kinh nghiệm',
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
      key: 'academicLevelId',
      label: 'TRÌNH ĐỘ HỌC VẤN',
      type: 'SELECT',
      placeholder: 'Trình độ HV',
      icon: SchoolIcon,
      getOptions: (_, allConfig) => allConfig?.academicLevelOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const dictVal = allConfig?.academicLevelDict?.[val];
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
      label: 'GIỚI TÍNH',
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
    {
      key: 'maritalStatusId',
      label: 'TÌNH TRẠNG HÔN NHÂN',
      type: 'SELECT',
      placeholder: 'TT hôn nhân',
      icon: FamilyIcon,
      getOptions: (_, allConfig) => allConfig?.maritalStatusOptions || [],
      formatLabel: (val, options, allConfig) => {
        if (!val) return '';
        const dictVal = allConfig?.maritalStatusDict?.[val];
        if (dictVal) return String(dictVal);
        const match = options?.find((o) => String(o.id) === String(val) || String(o.value) === String(val));
        return match ? match.name || match.label || String(val) : String(val);
      },
    },
  ],
};
