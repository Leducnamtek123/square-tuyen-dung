import React from "react";
import { useSelector } from "react-redux";
import { Box, Pagination, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Grid2 as Grid } from "@mui/material";
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import NoDataCard from "@/components/Common/NoDataCard";
import Company from "@/components/Features/Company";
import companyService from "@/services/companyService";
import { RootState } from "@/redux/store";
import type { Company as ModelsCompany } from '@/types/models';

const Companies = () => {
  const { t } = useTranslation('public');
  const { companyFilter } = useSelector((state: RootState) => state.filter);
  const { pageSize } = companyFilter;
  const [page, setPage] = React.useState(1);

  const filterKey = React.useMemo(() => JSON.stringify(companyFilter), [companyFilter]);

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(1);
  }, [filterKey]);

  const { data, isLoading } = useQuery({
    queryKey: ['companies', filterKey, page],
    queryFn: async () => {
      const resData = await companyService.getCompanies({
        ...companyFilter,
        page: page,
      });
      return {
        results: resData?.results || [],
        count: resData?.count || 0,
      };
    },
    staleTime: 3 * 60_000,
    placeholderData: keepPreviousData,
  });

  const companies = data?.results || [];
  const count = data?.count || 0;

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
          md: "row",
          lg: "row",
          xl: "row",
        }}
        sx={{ pb: 3 }}
        justifyContent="space-between"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {t("home.topCompanies", "Công ty nổi bật")}
            <Box
              component="span"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                backgroundColor: "primary.background",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.9em",
              }}
            >
              {t("home.companiesCount", { count: count, defaultValue: "{{count}} công ty" })}
            </Box>
          </Typography>
        </Box>
      </Stack>
      <Stack spacing={2}>
        {isLoading && !data ? (
          <Grid container spacing={2}>
            {Array.from(Array(12).keys()).map((value) => (
              <Grid
                key={value}
                size={{
                  xs: 12,
                  sm: 12,
                  md: 6,
                  lg: 4,
                  xl: 4
                }}>
                <Company.Loading />
              </Grid>
            ))}
          </Grid>
        ) : companies.length === 0 ? (
          <NoDataCard
            title={t("home.noCompaniesFound", "Hiện chưa tìm công ty phù hợp với tiêu chí của bạn")}
            svgKey="ImageSvg4"
          />
        ) : (
          <>
            <Grid container spacing={2}>
              {companies.map((value: ModelsCompany) => (
                <Grid
                  key={value.id}
                  size={{
                    xs: 12,
                    sm: 12,
                    md: 6,
                    lg: 4,
                    xl: 4
                  }}>
                  <Company
                    id={value.id as number}
                    slug={value.slug as string}
                    companyImageUrl={value.companyImageUrl || ''}
                    companyCoverImageUrl={value.companyCoverImageUrl || ''}
                    companyName={value.companyName || ''}
                    employeeSize={value.employeeSize as string | number}
                    fieldOperation={value.fieldOperation as string}
                    city={value.locationDict?.city as string}
                    followNumber={value.followNumber as number}
                    jobPostNumber={value.jobPostNumber as number}
                    isFollowed={value.isFollowed as boolean}
                  />
                </Grid>
              ))}
            </Grid>
            <Stack sx={{ py: 2 }}>
              {Math.ceil(count / pageSize) > 1 && (
                <Pagination
                  color="primary"
                  size="medium"
                  variant="text"
                  sx={{ margin: "0 auto" }}
                  count={Math.ceil(count / pageSize)}
                  page={page}
                  onChange={handleChangePage}
                />
              )}
            </Stack>
          </>
        )}
      </Stack>
    </>
  );
};

export default Companies;
