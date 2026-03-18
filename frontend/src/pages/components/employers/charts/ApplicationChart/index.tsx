interface ApplicationChartProps {
  title: string;
}

interface ApplicationChartData {
  labels: string[];
  title1: string;
  title2: string;
  data1: (number | null)[];
  data2: (number | null)[];
}

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Card, Divider, Stack, Tooltip as MuiTooltip, Typography, CircularProgress } from "@mui/material";

import InfoIcon from '@mui/icons-material/Info';

import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';

import { Chart } from 'react-chartjs-2';

import {

  Chart as ChartJS,
  ChartData,
  ChartOptions,

  CategoryScale,

  LinearScale,

  BarElement,

  PointElement,

  LineElement,

  Title,

  Tooltip,

  Legend,

} from 'chart.js';

import dayjs from 'dayjs';

import RangePickerCustom from '../../../../../components/controls/RangePickerCustom';

import statisticService from '../../../../../services/statisticService';

import { useTheme } from '@mui/material/styles';

interface Props {
  [key: string]: any;
}



ChartJS.register(

  CategoryScale,

  LinearScale,

  BarElement,

  PointElement,

  LineElement,

  Title,

  Tooltip,

  Legend

);

const options: ChartOptions<'bar'> = {

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

      },

      ticks: {

        font: {

          size: 12

        }

      }

    }

  }

};

const ApplicationChart = ({ title }: ApplicationChartProps) => {
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

        const resData = await statisticService.employerApplicationStatistics(params);

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

  const dataOptions = React.useMemo<ChartData<'bar' | 'line'>>(() => {
    const title2 = String(data?.title2 ?? '');
    const title2Key = title2.toLowerCase().replace(/\s+/g, '');
    const title1 = String(data?.title1 ?? '');
    const title1Key = title1.toLowerCase().replace(/\s+/g, '');
    return ({
      labels: data?.labels || [],
      datasets: [

      {

        type: 'line' as const,

        label: t(`applicationChart.labels.${title2Key}`, { defaultValue: title2 }),

        borderColor: theme.palette.primary.main,

        backgroundColor: theme.palette.primary.light || 'rgba(25, 118, 210, 0.1)',

        data: data?.data2 || [],

        tension: 0.4,

        borderWidth: 2,

        pointRadius: 4,

        pointHoverRadius: 6,

        pointBackgroundColor: '#fff',

        pointHoverBackgroundColor: '#fff',

        pointBorderWidth: 2,

        pointHoverBorderWidth: 2,

      },

      {

        type: 'bar' as const,

        label: t(`applicationChart.labels.${title1Key}`, { defaultValue: title1 }),

        backgroundColor: theme.palette.secondary.main,

        data: data?.data1 || [],

        borderRadius: 4,

        barThickness: 12,

        maxBarThickness: 12

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

              title={t('applicationChart.title')}

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

                <InsertChartOutlinedIcon sx={{ fontSize: 42, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">{t('applicationChart.noData')}</Typography>

              </Stack>

            ) : (

              <Box sx={{ height: 320 }}>

                <Chart type="bar" options={options} data={dataOptions as ChartData<'bar'>} />

              </Box>

            )}

          </Box>

        </Box>

      </Stack>

    </Card>

  );

};

export default ApplicationChart;
