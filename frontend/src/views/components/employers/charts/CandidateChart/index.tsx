import React from 'react';

import { useTranslation } from 'react-i18next';

import { Box, Card, Divider, Stack, Tooltip as MuiTooltip, Typography, CircularProgress } from "@mui/material";

import InfoIcon from '@mui/icons-material/Info';

import {

  Chart as ChartJS,
  ChartData, // Added ChartData import

  CategoryScale,

  LinearScale,

  PointElement,

  LineElement,

  Title,

  Tooltip,

  Legend,

} from 'chart.js';

import { Line } from 'react-chartjs-2';

import dayjs from 'dayjs';

import RangePickerCustom from '../../../../../components/controls/RangePickerCustom';

import { useEmployerCandidateStatistics } from '../../hooks/useEmployerQueries';

import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';

import { useTheme } from '@mui/material/styles';

interface Props {
  [key: string]: any;
}

// New interface for CandidateChart props
interface CandidateChartProps {
  title: string;
}

// New interface for the data state
interface CandidateChartData {
  title1: string;
  title2: string;
  labels: string[];
  data1: (number | null)[];
  data2: (number | null)[];
}

ChartJS.register(

  CategoryScale,

  LinearScale,

  PointElement,

  LineElement,

  Title,

  Tooltip,

  Legend

);

export const options = {

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

  },

  scales: {

    x: {

      grid: {

        display: false,

        drawBorder: false

      },

      ticks: {

        font: {

          size: 12

        }

      }

    },

    y: {

      grid: {

        color: 'rgba(0,0,0,0.05)',

        drawBorder: false

      },

      ticks: {

        font: {

          size: 12

        }

      }

    }

  }

};

const CandidateChart = ({ title }: CandidateChartProps) => {

  const { t } = useTranslation('employer');

  const theme = useTheme();

  const [isLoading, setIsLoading] = React.useState(true);

  const [allowSubmit, setAllowSubmit] = React.useState(false);

  const [selectedDateRange, setSelectedDateRange] = React.useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs(new Date()).subtract(1, 'month'),
    dayjs(new Date()),
  ]);

  const queryParams = React.useMemo(() => ({
    startDate: dayjs(selectedDateRange[0]).format('YYYY-MM-DD'),
    endDate: dayjs(selectedDateRange[1]).format('YYYY-MM-DD'),
  }), [selectedDateRange]);

  const { data, isLoading: queryLoading } = useEmployerCandidateStatistics(queryParams);

  React.useEffect(() => { setIsLoading(queryLoading); }, [queryLoading]);

  const dataOptions = React.useMemo(() => {
    const title1 = String(data?.title1 ?? '');
    const title1Key = title1.toLowerCase().replace(/\s+/g, '');
    const title2 = String(data?.title2 ?? '');
    const title2Key = title2.toLowerCase().replace(/\s+/g, '');
    return ({

    labels: data?.labels || [],

    datasets: [

      {

        label: t(`candidateChart.labels.${title1Key}`, { defaultValue: title1 }),

        data: data?.data1 || [],

        borderColor: theme.palette.secondary.main, // theme.palette.secondary.main

        backgroundColor: theme.palette.secondary.light || 'rgba(255, 152, 0, 0.1)',

        borderWidth: 2,

        tension: 0.4,

        pointRadius: 4,

        pointHoverRadius: 6,

        pointBackgroundColor: '#fff',

        pointHoverBackgroundColor: '#fff',

        pointBorderWidth: 2,

        pointHoverBorderWidth: 2,

      },

      {

        label: t(`candidateChart.labels.${title2Key}`, { defaultValue: title2 }),

        data: data?.data2 || [],

        borderColor: theme.palette.primary.main, // theme.palette.primary.main

        backgroundColor: theme.palette.primary.light || 'rgba(68, 29, 160, 0.1)',

        borderWidth: 2,

        tension: 0.4,

        pointRadius: 4,

        pointHoverRadius: 6,

        pointBackgroundColor: '#fff',

        pointHoverBackgroundColor: '#fff',

        pointBorderWidth: 2,

        pointHoverBorderWidth: 2,

      },

    ],

  });
  }, [data, t, theme]);

  return (

    <Card 

      sx={{ 

        p: 3,

        boxShadow: theme['customShadows']?.card || theme.shadows[1],

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

            <Typography variant="h5" color="text.primary">

              {title}

            </Typography>

            <MuiTooltip

              title={t('candidateChart.title')}

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

            ) : !data ? (

              <Stack

                alignItems="center"

                justifyContent="center"

                sx={{

                  height: 320,

                  bgcolor: 'grey.50',

                  borderRadius: 2

                }}

              >

                <Stack

                  alignItems="center"

                  justifyContent="center"

                  sx={{ py: 4 }}

                >

                  <Typography variant="body2" color="text.secondary">

                    {t('candidateChart.noData')}

                  </Typography>

                </Stack>

              </Stack>

            ) : (

              <Box sx={{ height: 320 }}>

                <Line data={dataOptions} options={options as any} height={300} />

              </Box>

            )}

          </Box>

        </Box>

      </Stack>

    </Card>

  );

};

export default CandidateChart;
