import React from "react";

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { Stack, Typography } from "@mui/material";

import Grid from "@mui/material/Grid2";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { searchJobPost } from "../../../../redux/filterSlice";
import { useAppDispatch, useAppSelector } from "../../../../hooks/useAppStore";

import { ROUTES } from "../../../../configs/constants";
import { useConfig } from '@/hooks/useConfig';

interface Option {
  id: string | number;
  name: string;
}

type FilterType = "CARRER" | "CITY" | "JOB_TYPE";

const maxItem = 6;

const JobByCategory = () => {
  const { t } = useTranslation('public');
  const { allConfig } = useConfig();

  const dispatch = useAppDispatch();

  const nav = useRouter();

  const { jobPostFilter } = useAppSelector((state) => state.filter);

  const careerOptions = (allConfig?.careerOptions || []) as any[];

  const cityOptions = (allConfig?.cityOptions || []) as any[];

  const jobTypeOptions = (allConfig?.jobTypeOptions || []) as any[];

  const handleFilter = (id: string | number, type: string) => {

    switch (type) {

      case "CARRER":

        dispatch(searchJobPost({ ...jobPostFilter, careerId: id as any }));

        break;

      case "CITY":

        dispatch(searchJobPost({ ...jobPostFilter, cityId: id as any }));

        break;

      case "JOB_TYPE":

        dispatch(searchJobPost({ ...jobPostFilter, jobTypeId: id as any }));

        break;

      default:

        break;

    }

    nav.push(`/${ROUTES.JOB_SEEKER.JOBS}`);

  };

  return (

    <Grid container spacing={4}>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 4,

          lg: 4,

          xl: 4

        }}>

        <Stack

          spacing={2.5}

          sx={{

            p: 3,

            height: "100%",

          }}

        >

          <Typography

            variant="h6"

            sx={{

              color: "primary.main",

              borderBottom: "2px solid",

              borderColor: "primary.main",

              pb: 1,

            }}

          >

            {t('jobByCategory.jobsByCareer')}
          </Typography>

          <Stack spacing={1.5}>

            {careerOptions?.slice(0, maxItem).map((item) => (

              <Typography

                sx={{

                  cursor: "pointer",

                  py: 0.5,

                  px: 1.5,

                  borderRadius: 1,

                  transition: "all 0.2s ease-in-out",

                  "&:hover": {

                    backgroundColor: "primary.background",

                    color: "primary.main",

                    transform: "translateX(8px)",

                  },

                }}

                key={item.id}

                onClick={() => handleFilter(item.id, "CARRER")}

              >

                {item.name}

              </Typography>

            ))}

            {careerOptions.length > maxItem && (

              <Typography

                variant="subtitle2"

                sx={{

                  mt: 1,

                  display: "flex",

                  alignItems: "center",

                  gap: 1,

                  color: "primary.main",

                  fontWeight: 600,

                  cursor: "pointer",

                  textDecoration: "none",

                  "&:hover": {

                    color: "primary.dark",

                  },

                }}

                component={Link}

                href={`/${ROUTES.JOB_SEEKER.JOBS_BY_CAREER}`}

              >

                {t('jobByCategory.viewAllCareers')} <FontAwesomeIcon icon={faChevronRight} />
              </Typography>

            )}

          </Stack>

        </Stack>

      </Grid>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 4,

          lg: 4,

          xl: 4

        }}>

        <Stack

          spacing={2.5}

          sx={{

            p: 3,

            height: "100%",

          }}

        >

          <Typography

            variant="h6"

            sx={{

              color: "primary.main",

              borderBottom: "2px solid",

              borderColor: "primary.main",

              pb: 1,

            }}

          >

            {t('jobByCategory.jobsByCity')}
          </Typography>

          <Stack spacing={1.5}>

            {cityOptions?.slice(0, maxItem).map((item) => (

              <Typography

                sx={{

                  cursor: "pointer",

                  py: 0.5,

                  px: 1.5,

                  borderRadius: 1,

                  transition: "all 0.2s ease-in-out",

                  "&:hover": {

                    backgroundColor: "primary.background",

                    color: "primary.main",

                    transform: "translateX(8px)",

                  },

                }}

                key={item.id}

                onClick={() => handleFilter(item.id, "CITY")}

              >

                {item.name}

              </Typography>

            ))}

            {cityOptions.length > maxItem && (

              <Typography

                variant="subtitle2"

                sx={{

                  mt: 1,

                  display: "flex",

                  alignItems: "center",

                  gap: 1,

                  color: "primary.main",

                  fontWeight: 600,

                  cursor: "pointer",

                  textDecoration: "none",

                  "&:hover": {

                    color: "primary.main",

                  },

                }}

                component={Link}

                href={`/${ROUTES.JOB_SEEKER.JOBS_BY_CITY}`}

              >

                {t('jobByCategory.viewAllCities')} <FontAwesomeIcon icon={faChevronRight} />
              </Typography>

            )}

          </Stack>

        </Stack>

      </Grid>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 4,

          lg: 4,

          xl: 4

        }}>

        <Stack

          spacing={2.5}

          sx={{

            p: 3,

            height: "100%",

          }}

        >

          <Typography

            variant="h6"

            sx={{

              color: "primary.main",

              borderBottom: "2px solid",

              borderColor: "primary.main",

              pb: 1,

            }}

          >

            {t('jobByCategory.jobsByJobType')}
          </Typography>

          <Stack spacing={1.5}>

            {jobTypeOptions?.slice(0, maxItem).map((item) => (

              <Typography

                sx={{

                  cursor: "pointer",

                  py: 0.5,

                  px: 1.5,

                  borderRadius: 1,

                  transition: "all 0.2s ease-in-out",

                  "&:hover": {

                    backgroundColor: "primary.background",

                    color: "primary.main",

                    transform: "translateX(8px)",

                  },

                }}

                key={item.id}

                onClick={() => handleFilter(item.id, "JOB_TYPE")}

              >

                {item.name}

              </Typography>

            ))}

            {jobTypeOptions.length > maxItem && (

              <Typography

                variant="subtitle2"

                sx={{

                  mt: 1,

                  display: "flex",

                  alignItems: "center",

                  gap: 1,

                  color: "primary.main",

                  fontWeight: 600,

                  cursor: "pointer",

                  textDecoration: "none",

                  "&:hover": {

                    color: "primary.main",

                  },

                }}

                component={Link}

                href={`/${ROUTES.JOB_SEEKER.JOBS_BY_TYPE}`}

              >

                {t('jobByCategory.viewAllJobTypes')}{" "}
                <FontAwesomeIcon icon={faChevronRight} />
              </Typography>

            )}

          </Stack>

        </Stack>

      </Grid>

    </Grid>

  );

};

export default JobByCategory;
