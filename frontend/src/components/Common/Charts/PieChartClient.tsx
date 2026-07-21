'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';

type ChartProps = {
  data: any;
  options?: any;
  height?: number | string;
  width?: number | string;
  variant?: 'pie' | 'doughnut';
};

const cssSize = (size?: number | string) => (typeof size === 'number' ? `${size}px` : size);

const PieChartClient = dynamic(
  async () => {
    const [{ Chart: ChartJS, ArcElement, PieController, DoughnutController, Tooltip, Legend }, { Doughnut, Pie }] = await Promise.all([
      import('chart.js'),
      import('react-chartjs-2'),
    ]);

    ChartJS.register(ArcElement, PieController, DoughnutController, Tooltip, Legend);

    return function PieChart({ data, options, height, width, variant = 'doughnut' }: ChartProps) {
      const ChartComponent = variant === 'pie' ? Pie : Doughnut;
      return (
        <Box sx={{ position: 'relative', width: cssSize(width) || '100%', height: cssSize(height) || '100%' }}>
          <ChartComponent data={data} options={options} />
        </Box>
      );
    };
  },
  { ssr: false }
);

export default PieChartClient;
