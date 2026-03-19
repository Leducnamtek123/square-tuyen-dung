import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card } from "@mui/material";
import Grid from "@mui/material/Grid2";
import InputBaseSearchHomeCustom from '../../../../components/controls/InputBaseSearchHomeCustom';
import SingleSelectSearchCustom from '../../../../components/controls/SingleSelectSearchCustom';
import { useTranslation } from 'react-i18next';
import {
  resetSearchJobPostFilter,
  searchJobPost,
} from '../../../../redux/filterSlice';
import { ROUTES } from '../../../../configs/constants';

const HomeSearch = () => {
  const { t } = useTranslation(['common']);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { allConfig } = useSelector((state: any) => state.config);

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
    } catch (error) {
      console.error('Loi khi set kw vao local storage: ', error);
    }
  };

  const handleFilter = (data: any) => {
    handleSaveKeyworLocalStorage(data?.kw);
    dispatch(searchJobPost(data));
    nav(`/${ROUTES.JOB_SEEKER.JOBS}`);
  };

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(0,0,0,.35)',
        borderRadius: 3.5,
        p: 4,
        pt: 5,
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
