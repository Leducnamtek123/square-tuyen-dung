/*

Project Recruitment System - Part of Project Platform

Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy

License: MIT License

See the LICENSE file in the project root for full license information.

*/

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Card, Divider, Stack, Tooltip as MuiTooltip, Typography, CircularProgress } from "@mui/material";

import InfoIcon from '@mui/icons-material/Info';

import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import { Pie } from 'react-chartjs-2';

import dayjs from 'dayjs';

import RangePickerCustom from '../../../../../components/controls/RangePickerCustom';

import statisticService from '../../../../../services/statisticService';

import { useTheme } from '@mui/material/styles';

interface Props {
  [key: string]: any;
}

interface HiringAcademicChartProps {
  title: string;
}

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    legend: {
      position: 'bottom' as const,

      labels: {

        padding: 20,

        usePointStyle: true,

        pointStyle: 'circle',

        font: {

          size: 12

        }

      }

    },

    tooltip: {

      backgroundColor: 'rgba(255, 255, 255, 0.95)',

      titleColor: '#212529',

      bodyColor: '#212529',

      padding: 12,

      boxPadding: 6,

      borderColor: 'rgba(0,0,0,0.1)',

      borderWidth: 1,

      usePointStyle: true,

    }

  }

};

const HiringAcademicChart = ({ title }: HiringAcademicChartProps) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();

  const [isLoading, setIsLoading] = React.useState(true);

  const [allowSubmit, setAllowSubmit] = React.useState(false);

  const [selectedDateRange, setSelectedDateRange] = React.useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs(new Date()).subtract(1, 'month'),
    dayjs(new Date()),
  ]);

  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {

    const statistics = async (params: any) => {

      setIsLoading(true);

      try {

        const resData = await statisticService.employerRecruitmentStatisticsByRank(params);

        setData((resData as any).data);

      } catch (error) {

        console.error('Error: ', error);

      } finally {

        setIsLoading(false);

      }

    };

    statistics({

      startDate: dayjs(selectedDateRange[0]).format('YYYY-MM-DD').toString(),

      endDate: dayjs(selectedDateRange[1]).format('YYYY-MM-DD').toString(),

    });

  }, [allowSubmit, selectedDateRange]);

  const dataOptions = React.useMemo(() => {
    const labels = data?.labels?.map((label: any) => {
      const safeLabel = String(label ?? '');
      const labelKey = safeLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
      return t(`hiringAcademicChart.labels.${labelKey}`, { defaultValue: safeLabel });
    }) || [];

    return {

      labels: labels,

      datasets: [

        {

          label: t('hiringAcademicChart.applicationCount'),

          data: data?.data || [],

          backgroundColor: [

            'rgba(255, 152, 0, 0.9)',  // secondary

            'rgba(25, 118, 210, 0.9)', // primary (fixed blue)

            'rgba(46, 125, 50, 0.9)',  // success

            'rgba(2, 136, 209, 0.9)',  // info

            'rgba(211, 47, 47, 0.9)',  // error

          ],

          borderWidth: 0,

          borderRadius: 4,

          spacing: 2,

          hoverOffset: 4

        },

      ],

    };
  }, [data, t]);

  return (

    <Card 

      sx={{ 

        p: 3,

        boxShadow: theme.customShadows?.card || theme.shadows[1],

        border: `1px solid ${theme.palette.divider}`,

        height: '100%'

      }}

    >

      <Stack spacing={3}>

        <Box>

          <Stack

            direction="row"

            justifyContent="space-between"

            alignItems="center"

          >

            <Typography variant="h5" color="text.primary">{title}</Typography>

            <MuiTooltip

              title={t('hiringAcademicChart.title')}

              arrow

              placement="left"

            >

              <InfoIcon

                sx={{

                  color: 'grey.400',

                  cursor: 'pointer',

                  '&:hover': {

                    color: 'primary.main',

                  },

                }}

              />

            </MuiTooltip>

          </Stack>

        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box>

          <Stack

            direction="row"

            justifyContent="flex-end"

            spacing={1}

            mb={3}

          >

            <RangePickerCustom

              allowSubmit={allowSubmit}

              setAllowSubmit={setAllowSubmit}

              selectedDateRange={selectedDateRange}

              setSelectedDateRange={setSelectedDateRange}

            />

          </Stack>

          <Box sx={{ position: 'relative', minHeight: 320 }}>

            {isLoading ? (

              <Stack

                alignItems="center"

                justifyContent="center"

                sx={{ height: 320 }}

              >

                <CircularProgress 

                  size={40}

                  thickness={3}

                  sx={{

                    color: 'primary.main'

                  }}

                />

              </Stack>

            ) : !data || !Array.isArray(data?.data) || data.data.length === 0 ? (

              <Stack

                alignItems="center"

                justifyContent="center"

                sx={{

                  height: 320,

                  bgcolor: 'grey.50',

                  borderRadius: 2

                }}

              >

                <InsertChartOutlinedIcon sx={{ fontSize: 42, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {t('hiringAcademicChart.noData')}
                </Typography>

              </Stack>

            ) : (

              <Box sx={{ height: 320 }}>
                <Pie data={dataOptions} options={options as any} height={300} />
              </Box>

            )}

          </Box>

        </Box>

      </Stack>

    </Card>

  );

};

export default HiringAcademicChart;
