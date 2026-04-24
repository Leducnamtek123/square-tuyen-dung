'use client';

import React from 'react';
import dynamic from 'next/dynamic';

type ChartProps = {
  data: any;
  options?: any;
  height?: number;
  width?: number;
};

const PieChartClient = dynamic(
  async () => {
    const [{ Chart: ChartJS, ArcElement, Tooltip, Legend }, { Pie }] = await Promise.all([
      import('chart.js'),
      import('react-chartjs-2'),
    ]);

    ChartJS.register(ArcElement, Tooltip, Legend);

    return function PieChart({ data, options, height, width }: ChartProps) {
      return <Pie data={data} options={options} height={height} width={width} />;
    };
  },
  { ssr: false }
);

export default PieChartClient;
