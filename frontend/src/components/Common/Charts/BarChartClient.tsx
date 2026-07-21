'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';

type ChartProps = {
  data: any;
  options?: any;
  height?: number | string;
  width?: number | string;
};

const cssSize = (size?: number | string) => (typeof size === 'number' ? `${size}px` : size);

const BarChartClient = dynamic(
  async () => {
    const [{ Chart: ChartJS, CategoryScale, LinearScale, BarController, LineController, BarElement, LineElement, PointElement, Filler, Title, Tooltip, Legend }, { Bar }] = await Promise.all([
      import('chart.js'),
      import('react-chartjs-2'),
    ]);

    ChartJS.register(CategoryScale, LinearScale, BarController, LineController, BarElement, LineElement, PointElement, Filler, Title, Tooltip, Legend);

    return function BarChart({ data, options, height, width }: ChartProps) {
      return (
        <Box sx={{ position: 'relative', width: cssSize(width) || '100%', height: cssSize(height) || '100%' }}>
          <Bar data={data} options={options} />
        </Box>
      );
    };
  },
  { ssr: false }
);

export default BarChartClient;
