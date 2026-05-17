'use client';
import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Box, Card, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import { formatRoute } from '@/utils/funcUtils';
import { ROUTES } from '@/configs/constants';

interface CompanyActionProps {
  id: string | number;
  views: number;
  createAt: string;
  resume: Partial<Resume> | null;
  company: Partial<Company> | null;
  children: React.ReactNode;
}



const CompanyAction = ({ id, views, createAt, resume, company, children }: CompanyActionProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const [stackDirection, setStackDirection] = React.useState<'row' | 'column'>('column');

  const theme = useTheme();
  const companyHref = company?.slug
    ? `/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, company.slug as string)}`
    : '#';

  React.useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setStackDirection(entry.contentRect.width < 800 ? 'column' : 'row');
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (

    <div ref={parentRef}>

      <Card

        variant="outlined"

        sx={{

          p: 1.5,

          transition: 'all 0.3s ease',

          border: `1px solid ${theme.palette.grey[100]}`,

          boxShadow: 0,

          '&:hover': {

            borderColor: theme.palette.primary.main,

            boxShadow: theme.customShadows.small,

            transform: 'translateY(-2px)'

          },

        }}

      >

        <Stack direction={stackDirection} spacing={1.5} width="100%">

          <Stack direction="row" spacing={2}>

            <Stack justifyContent="center">

              <MuiImageCustom

                width={85}

                height={85}

                src={company?.companyImageUrl}

                sx={{ 

                  borderRadius: 2,

                  border: `1px solid ${theme.palette.grey[200]}`,

                  p: 0.5,

                  backgroundColor: 'white',

                }}

              />

            </Stack>

            <Stack

              flex={1}

              justifyContent="center" 

              spacing={1}

              style={{ overflow: 'hidden' }}

            >

              <Tooltip followCursor title={company?.companyName}>

                <Typography

                  component={Link}
                  href={companyHref}
                  prefetch={Boolean(company?.slug)}
                  variant="h6"

                  sx={{

                    fontSize: 16,

                    cursor: 'pointer',

                    color: theme.palette.primary.main,
                    textDecoration: 'none',

                    transition: 'color 0.2s ease',

                    '&:hover': {

                      color: theme.palette.primary.dark

                    }

                  }}

                  noWrap

                >

                  {company?.companyName}

                </Typography>

              </Tooltip>

              <Stack spacing={0.5}>

                <Typography

                  variant="body2"

                  sx={{

                    color: theme.palette.text.secondary,

                    display: 'flex',

                    alignItems: 'center',

                    gap: 1

                  }}

                >

                  Đã xem hồ sơ {resume?.title} {views} lần

                </Typography>

                <Typography

                  variant="body2"

                  sx={{

                    color: theme.palette.text.secondary,

                    display: 'flex',

                    alignItems: 'center',

                    gap: 1

                  }}

                >

                  Lần xem cuối {dayjs(createAt).format('DD/MM/YYYY HH:mm')}

                </Typography>

              </Stack>

            </Stack>

          </Stack>

          <Stack

            direction="row"

            justifyContent="flex-end"

            alignItems="center"

            flex={1}

            spacing={2}

          >

            {children}

          </Stack>

        </Stack>

      </Card>

    </div>

  );

};

interface CompanyActionFollowProps {
  id: string | number;
  company: Partial<Company> | null;
  children: React.ReactNode;
}

import CompanyActionFollow from './CompanyActionFollow';
import Loading from './Loading';
import type { Resume } from '@/types/models';
import type { Company } from '@/types/models';

const CompanyActionWithSubComponents = Object.assign(CompanyAction, {
  CompanyActionFollow,
  Loading
});

export default CompanyActionWithSubComponents;
