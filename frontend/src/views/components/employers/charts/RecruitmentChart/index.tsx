/*

Project Recruitment System - Part of Project Platform

Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy

License: MIT License

See the LICENSE file in the project root for full license information.

*/

import React from "react";
import { useTranslation } from 'react-i18next';

import { Box, Card, Divider, Stack, Tooltip as MuiTooltip, Typography, CircularProgress } from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";

import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";

import {

  Chart as ChartJS,

  CategoryScale,

  LinearScale,

  BarElement,
  ChartData,
  ChartOptions,

  Title,

  Tooltip,

  Legend,

} from "chart.js";

import { Bar } from "react-chartjs-2";

import dayjs, { Dayjs } from "dayjs";

import RangePickerCustom from "../../../../../components/Common/Controls/RangePickerCustom";

import { useEmployerRecruitmentStatistics } from '../../hooks/useEmployerQueries';

interface Props {
  [key: string]: any;
}

interface RecruitmentChartProps {
  title: string;
}

interface RecruitmentDataItem {
  label: string;
  data: number[];
}


const colors = [

  "rgba(255, 159, 64, 0.9)",

  "rgba(255, 206, 86, 0.9)",

  "rgba(153, 102, 255, 0.9)",

  "rgba(54, 162, 235, 0.9)",

  "rgba(75, 192, 192, 0.9)",

  "rgba(255, 99, 132, 0.9)",

];

ChartJS.register(

  CategoryScale,

  LinearScale,

  BarElement,

  Title,

  Tooltip,

  Legend

);

export const options: ChartOptions<'bar'> = {

  plugins: {

    legend: {

      position: "bottom" as const,

      labels: {

        padding: 20,

        usePointStyle: true,

        pointStyle: "circle",

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

  },

  responsive: true,

  maintainAspectRatio: false,

  interaction: {
    mode: "index" as const,
    intersect: false,
  },

  scales: {

    x: {

      stacked: true,

      grid: {

        display: false,

      },

      ticks: {

        font: {

          size: 12

        }

      }

    },

    y: {

      stacked: true,

      grid: {

        color: "rgba(0,0,0,0.05)",

      },

      ticks: {

        font: {

          size: 12

        }

      }

    }

  }

};

const RecruitmentChart = ({ title }: RecruitmentChartProps) => {
  const { t } = useTranslation('employer');

  const [isLoading, setIsLoading] = React.useState(true);

  const [allowSubmit, setAllowSubmit] = React.useState(false);

  const [selectedDateRange, setSelectedDateRange] = React.useState<[Dayjs, Dayjs]>([
    dayjs(new Date()).subtract(1, "month"),
    dayjs(new Date()),
  ]);

  const queryParams = React.useMemo(() => ({
    startDate: dayjs(selectedDateRange[0]).format('YYYY-MM-DD'),
    endDate: dayjs(selectedDateRange[1]).format('YYYY-MM-DD'),
  }), [selectedDateRange]);

  const { data, isLoading: queryLoading } = useEmployerRecruitmentStatistics(queryParams);

  React.useEffect(() => { setIsLoading(queryLoading); }, [queryLoading]);

  const dataOptions = React.useMemo<ChartData<'bar'>>(() => {
    const safeData = Array.isArray(data) ? data : [];

    var datasets = [];

    for (let i = safeData.length - 1; i >= 0; i--) {
      const labelText = safeData[i]?.label;
      const labelKey = String(labelText ?? '')
        .toLowerCase()
        .replace(/\s+/g, '');

      datasets.push({

        label: t(`recruitmentChart.labels.${labelKey}`, { defaultValue: labelText }),

        data: (safeData[i]?.data || []),

        backgroundColor: colors[i],

        stack: "Stack 0",

        borderRadius: 4,

        barThickness: 12,

        maxBarThickness: 12

      });

    }

    const d: ChartData<'bar'> = {

      labels: [""],

      datasets: datasets as ChartData<'bar'>['datasets'],

    };

    return d;

  }, [data, t]);

  return (

    <Card 
      sx={{ 
        p: 3,
        boxShadow: (theme) => theme.customShadows?.card || theme.shadows[1],
        border: (theme) => `1px solid ${theme.palette.divider}`,
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

            <Typography variant="h5" color="text.primary">

              {title}

            </Typography>

            <MuiTooltip
              title={t('recruitmentChart.title')}
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

          <Stack direction="row" justifyContent="flex-end" spacing={1} mb={3}>

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

            ) : (Array.isArray(data) ? data.length === 0 : true) ? (

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
                <Typography variant="body2" color="text.secondary">{t('recruitmentChart.noData')}</Typography>

              </Stack>

            ) : (

              <Box sx={{ height: 320 }}>

                <Bar options={options} data={dataOptions} />

              </Box>

            )}

          </Box>

        </Box>

      </Stack>

    </Card>

  );

};

export default RecruitmentChart;
