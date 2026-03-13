import React from 'react';

import { useTranslation } from 'react-i18next';

import { Box, Card, Divider, Stack, Tooltip as MuiTooltip, Typography, CircularProgress } from "@mui/material";

import InfoIcon from '@mui/icons-material/Info';

import {

  Chart as ChartJS,

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

import statisticService from '../../../../../services/statisticService';

import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';

import { useTheme } from '@mui/material/styles';

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

      position: 'bottom',

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

const CandidateChart = ({ title }) => {

  const { t } = useTranslation('employer');

  const theme = useTheme();

  const [isLoading, setIsLoading] = React.useState(true);

  const [allowSubmit, setAllowSubmit] = React.useState(false);

  const [selectedDateRange, setSelectedDateRange] = React.useState([

    dayjs(new Date()).subtract(1, 'month'),

    dayjs(new Date()),

  ]);

  const [data, setData] = React.useState(null);

  React.useEffect(() => {

    const statistics = async (params) => {

      setIsLoading(true);

      try {

        const resData = await statisticService.employerCandidateStatistics(params);

        setData(resData.data);

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

  const dataOptions = React.useMemo(() => ({

    labels: data?.labels || [],

    datasets: [

      {

        label: t(`candidateChart.labels.${data?.title1?.toLowerCase().replace(/\s+/g, '')}`, { defaultValue: data?.title1 }),

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

        label: t(`candidateChart.labels.${data?.title2?.toLowerCase().replace(/\s+/g, '')}`, { defaultValue: data?.title2 }),

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

  }), [data, t, theme]);

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

                <Line options={options} data={dataOptions} />

              </Box>

            )}

          </Box>

        </Box>

      </Stack>

    </Card>

  );

};

export default CandidateChart;
