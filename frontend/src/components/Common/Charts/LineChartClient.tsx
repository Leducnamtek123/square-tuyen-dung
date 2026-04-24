import React from 'react';
import dynamic from 'next/dynamic';

type ChartProps = {
  data: any;
  options?: any;
  height?: number;
  width?: number;
};

const LineChartClient = dynamic(
  async () => {
    const [{ Chart: ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend }, { Line }] = await Promise.all([
      import('chart.js'),
      import('react-chartjs-2'),
    ]);

    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

    return function LineChart({ data, options, height, width }: ChartProps) {
      return <Line data={data} options={options} height={height} width={width} />;
    };
  },
  { ssr: false }
);

export default LineChartClient;
