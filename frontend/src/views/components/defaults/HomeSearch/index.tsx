'use client';
import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Box } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import InputBaseSearchHomeCustom from '../../../../components/Common/Controls/InputBaseSearchHomeCustom';
import SingleSelectSearchCustom from '../../../../components/Common/Controls/SingleSelectSearchCustom';
import { useTranslation } from 'react-i18next';
import {
  resetSearchJobPostFilter,
  searchJobPost,
} from '../../../../redux/filterSlice';
import { ROUTES } from '../../../../configs/constants';
import { useConfig } from '@/hooks/useConfig';
import type { JobPostFilter } from '../../../../redux/filterSlice';
import {
  PROJECT_SEARCH_HISTORY_STORAGE_KEY,
  LEGACY_PROJECT_SEARCH_HISTORY_STORAGE_KEY,
  readVersionedJson,
  writeVersionedJson,
} from '@/utils/storageKeys';

const HomeSearch = () => {
  const { t } = useTranslation(['common']);
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { allConfig } = useConfig();

  const { jobPostFilter } = useAppSelector((state) => state.filter);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      kw: '',
      cityId: '',
      careerId: '',
    },
  });

  React.useEffect(() => {
    dispatch(resetSearchJobPostFilter());
  }, [dispatch]);

  const handleSaveKeyworLocalStorage = (kw: string) => {
    try {
      if (kw) {
        const keywordList = readVersionedJson<string[]>(
          PROJECT_SEARCH_HISTORY_STORAGE_KEY,
          [LEGACY_PROJECT_SEARCH_HISTORY_STORAGE_KEY]
        ) ?? [];
        if (!keywordList.includes(kw)) {
          const nextKeywords =
            keywordList.length >= 5
              ? [kw, ...keywordList.slice(0, keywordList.length - 1)]
              : [kw, ...keywordList];
          writeVersionedJson(PROJECT_SEARCH_HISTORY_STORAGE_KEY, nextKeywords);
        }
      }
    } catch {
      // localStorage access may fail in private browsing
    }
  };

  const handleFilter = (data: { kw: string; cityId: string; careerId: string }) => {
    handleSaveKeyworLocalStorage(data?.kw);
    dispatch(searchJobPost({ ...jobPostFilter, ...data } as JobPostFilter));
    push(`/${ROUTES.JOB_SEEKER.JOBS}`);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFilter)}
      sx={{
        borderRadius: 3.5,
        p: { xs: 1.25, sm: 1.5, md: 2 },
        backgroundColor: 'rgba(255,255,255,0.72)',
        border: '1px solid rgba(26, 64, 125, 0.1)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12 }}>
          <InputBaseSearchHomeCustom
            name="kw"
            control={control}
            placeholder={t("common:search.button")}
            showSubmitButton={true}
            location='HOME'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectSearchCustom
            name="careerId"
            placeholder={t("common:placeholders.fieldOperation.all")}
            control={control}
            options={allConfig?.careerOptions || []}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectSearchCustom
            name="cityId"
            placeholder={t("common:placeholders.selectCity")}
            control={control}
            options={allConfig?.cityOptions || []}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeSearch;
