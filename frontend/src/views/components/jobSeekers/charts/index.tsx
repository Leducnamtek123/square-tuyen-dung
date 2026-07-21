'use client';

import dynamic from 'next/dynamic';

const ActivityChart = dynamic(() => import('./ActivityChartClient'), { ssr: false });

export default ActivityChart;
