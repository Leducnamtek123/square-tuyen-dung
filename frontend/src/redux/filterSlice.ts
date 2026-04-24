import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface JobPostFilter {
  kw: string;
  careerId: string;
  cityId: string;
  districtId: string;
  wardId: string;
  positionId: string;
  experienceId: string;
  typeOfWorkplaceId: string;
  jobTypeId: string;
  genderId: string;
  page: number;
  pageSize: number;
}

export interface CompanyFilter {
  kw: string;
  cityId: string;
  page: number;
  pageSize: number;
}

export interface ResumeFilter {
  kw: string;
  cityId: string;
  careerId: string;
  experienceId: string;
  positionId: string;
  academicLevelId: string;
  typeOfWorkplaceId: string;
  jobTypeId: string;
  genderId: string;
  maritalStatusId: string;
  page: number;
  pageSize: number;
}

interface FilterState {
  jobPostFilter: JobPostFilter;
  companyFilter: CompanyFilter;
  resumeFilter: ResumeFilter;
}

const initialJobPostFilter: JobPostFilter = {
  kw: '',
  careerId: '',
  cityId: '',
  districtId: '',
  wardId: '',
  positionId: '',
  experienceId: '',
  typeOfWorkplaceId: '',
  jobTypeId: '',
  genderId: '',
  page: 1,
  pageSize: 30,
};

const initialCompanyFilter: CompanyFilter = {
  kw: '',
  cityId: '',
  page: 1,
  pageSize: 12,
};

const initialResumeFilter: ResumeFilter = {
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
  pageSize: 10,
};

const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    jobPostFilter: initialJobPostFilter,
    companyFilter: initialCompanyFilter,
    resumeFilter: initialResumeFilter,
  } as FilterState,
  reducers: {
    searchJobPost: (state, action: PayloadAction<JobPostFilter>) => {
      state.jobPostFilter = action.payload;
    },
    searchJobPostWithKeyword: (state, action: PayloadAction<{ kw?: string }>) => {
      state.jobPostFilter = {
        ...initialJobPostFilter,
        kw: action?.payload?.kw as string,
      };
    },
    resetSearchJobPostFilter: (state) => {
      state.jobPostFilter = { ...initialJobPostFilter };
    },
    searchCompany: (state, action: PayloadAction<CompanyFilter>) => {
      state.companyFilter = action.payload;
    },
    resetSearchCompany: (state) => {
      state.companyFilter = { ...initialCompanyFilter };
    },
    searchResume: (state, action: PayloadAction<ResumeFilter>) => {
      state.resumeFilter = action.payload;
    },
    resetSearchResume: (state) => {
      state.resumeFilter = { ...initialResumeFilter };
    },
  },
});

const { reducer } = filterSlice;
const {
  searchJobPost,
  searchJobPostWithKeyword,
  resetSearchJobPostFilter,
  searchCompany,
  resetSearchCompany,
  searchResume,
  resetSearchResume,
} = filterSlice.actions;

export default reducer;
export {
  searchJobPost,
  searchJobPostWithKeyword,
  resetSearchJobPostFilter,
  searchCompany,
  resetSearchCompany,
  searchResume,
  resetSearchResume,
};
