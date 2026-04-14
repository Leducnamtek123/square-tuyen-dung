import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Card } from "@mui/material";
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

const HomeSearch = () => {
  const { t } = useTranslation(['common']);
  const dispatch = useDispatch();
  const nav = useRouter();
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
        const keywordListStr = localStorage.getItem('project_search_history');
        if (
          keywordListStr !== null &&
          keywordListStr !== undefined &&
          keywordListStr !== ''
        ) {
          const keywordList = JSON.parse(keywordListStr);
          if (!keywordList.includes(kw)) {
            if (keywordList.length >= 5) {
              localStorage.setItem(
                'project_search_history',
                JSON.stringify([
                  kw,
                  ...keywordList.slice(0, keywordList.length - 1),
                ])
              );
            } else {
              localStorage.setItem(
                'project_search_history',
                JSON.stringify([kw, ...keywordList])
              );
            }
          }
        } else {
          localStorage.setItem('project_search_history', JSON.stringify([kw]));
        }
      }
    } catch {
      // localStorage access may fail in private browsing
    }
  };

  const handleFilter = (data: { kw: string; cityId: string; careerId: string }) => {
    handleSaveKeyworLocalStorage(data?.kw);
    dispatch(searchJobPost({ ...jobPostFilter, ...data } as JobPostFilter));
    nav.push(`/${ROUTES.JOB_SEEKER.JOBS}`);
  };

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(0,0,0,.35)',
        borderRadius: 3.5,
        p: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2.5, sm: 3.5, md: 5 },
      }}
    >
      <form onSubmit={handleSubmit(handleFilter)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <InputBaseSearchHomeCustom
              name="kw"
              control={control}
              placeholder={t("common:search")}
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
      </form>
    </Card>
  );
};

export default HomeSearch;
