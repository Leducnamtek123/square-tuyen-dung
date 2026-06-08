'use client';
import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Box, Button, Grid2 as Grid } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
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
import { localizeRoutePath } from '../../../../configs/routeLocalization';

type HomeSearchProps = {
  variant?: 'default' | 'hero';
};

const HomeSearch = ({ variant = 'default' }: HomeSearchProps) => {
  const { t, i18n } = useTranslation(['common']);
  const isHero = variant === 'hero';
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { allConfig } = useConfig();
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

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
    push(jobsHref);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFilter)}
      sx={{
        borderRadius: isHero ? { xs: 2.5, md: 3 } : 3.5,
        p: isHero ? { xs: 1.25, md: 1.5 } : { xs: 1.25, sm: 1.5, md: 2 },
        backgroundColor: isHero ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.72)',
        border: isHero ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(26, 64, 125, 0.1)',
        boxShadow: isHero ? '0 22px 48px rgba(3, 18, 38, 0.22)' : 'inset 0 1px 0 rgba(255,255,255,0.8)',
        backdropFilter: isHero ? 'blur(10px)' : 'blur(14px)',
      }}
    >
      <Grid container spacing={isHero ? { xs: 1, md: 1.25 } : 1.5} alignItems="center">
        <Grid size={isHero ? { xs: 12, md: 6 } : { xs: 12 }}>
          <InputBaseSearchHomeCustom
            name="kw"
            control={control}
            placeholder={isHero ? t('common:jobSearch.searchPlaceholder', 'Vị trí tuyển dụng, kỹ năng...') : t("common:search.button")}
            showSubmitButton={!isHero}
            location='HOME'
            variant={variant}
          />
        </Grid>
        {!isHero && (
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectSearchCustom
            name="careerId"
            placeholder={t("common:placeholders.fieldOperation.all")}
            control={control}
            options={allConfig?.careerOptions || []}
          />
        </Grid>
        )}
        <Grid size={isHero ? { xs: 12, md: 3.5 } : { xs: 12, md: 6 }}>
          <SingleSelectSearchCustom
            name="cityId"
            placeholder={isHero ? t('common:placeholders.allCities', 'Tất cả địa điểm') : t("common:placeholders.selectCity")}
            control={control}
            options={allConfig?.cityOptions || []}
            variant={variant}
          />
        </Grid>
        {isHero && (
          <Grid size={{ xs: 12, md: 2.5 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
              fullWidth
              sx={{
                minHeight: 48,
                borderRadius: 2,
                fontWeight: 800,
                boxShadow: '0 12px 26px rgba(4, 31, 71, 0.22)',
              }}
            >
              {t('common:search.button')}
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default HomeSearch;
