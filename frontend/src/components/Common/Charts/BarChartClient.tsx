import React from 'react';
import dynamic from 'next/dynamic';

type ChartProps = {
  data: any;
  options?: any;
  height?: number;
  width?: number;
};

const BarChartClient = dynamic(
  async () => {
    const [{ Chart: ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend }, { Bar }] = await Promise.all([
      import('chart.js'),
      import('react-chartjs-2'),
    ]);

    ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

    return function BarChart({ data, options, height, width }: ChartProps) {
      return <Bar data={data} options={options} height={height} width={width} />;
    };
  },
  { ssr: false }
);

export default BarChartClient;
