'use client';

import React, { useId, useState } from 'react';

export interface RadarDimension {
  key: string;
  label: string;
  value: number; // 0 - 100
  maxValue?: number;
  color?: string;
}

export interface CompetencyRadarChartProps {
  dimensions?: RadarDimension[];
  size?: number;
  className?: string;
  showLabels?: boolean;
  interactive?: boolean;
  accentColor?: string;
  fillOpacity?: number;
}

const DEFAULT_DIMENSIONS: RadarDimension[] = [
  { key: 'content', label: 'Nội dung', value: 0 },
  { key: 'clarity', label: 'Rõ ràng', value: 0 },
  { key: 'relevance', label: 'Liên quan', value: 0 },
  { key: 'confidence', label: 'Tự tin', value: 0 },
];

const GRID_LEVELS = [25, 50, 75, 100];

/**
 * Calculates (x, y) coordinates for a given axis index, value ratio, center and radius.
 * For 4 axes:
 * 0 (Top): -90 deg
 * 1 (Right): 0 deg
 * 2 (Bottom): 90 deg
 * 3 (Left): 180 deg
 */
export function getRadarPoint(
  index: number,
  totalAxes: number,
  ratio: number,
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number } {
  // Angle starting from top (-PI / 2) going clockwise
  const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const r = radius * clampedRatio;
  return {
    x: Number((cx + r * Math.cos(angle)).toFixed(2)),
    y: Number((cy + r * Math.sin(angle)).toFixed(2)),
  };
}

/**
 * Generates an SVG path string for a polygon connecting the points of each dimension.
 */
export function generatePolygonPath(
  values: number[],
  cx: number,
  cy: number,
  radius: number
): string {
  const total = values.length;
  if (total === 0) return '';
  const points = values.map((val, idx) => {
    const pt = getRadarPoint(idx, total, val / 100, cx, cy, radius);
    return `${pt.x},${pt.y}`;
  });
  return `M ${points.join(' L ')} Z`;
}

export const CompetencyRadarChart: React.FC<CompetencyRadarChartProps> = ({
  dimensions = DEFAULT_DIMENSIONS,
  size = 320,
  className = '',
  showLabels = true,
  interactive = true,
  accentColor = '#2563eb', // Royal Blue #2563eb
  fillOpacity = 0.22,
}) => {
  const gradientId = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG canvas geometry
  const width = size;
  const height = size;
  const cx = width / 2;
  const cy = height / 2;
  // Radius occupies around 60% of size leaving comfortable space for vertex labels & scores
  const radius = size * 0.31;

  const totalAxes = dimensions.length;
  const values = dimensions.map((d) => Math.round(Math.max(0, Math.min(100, d.value))));
  const dataPolygonPath = generatePolygonPath(values, cx, cy, radius);

  // Coordinate positions for each vertex label
  const labelOffsets = [
    { x: 0, y: -24, textAnchor: 'middle' }, // Top
    { x: 26, y: 0, textAnchor: 'start' },  // Right
    { x: 0, y: 26, textAnchor: 'middle' }, // Bottom
    { x: -26, y: 0, textAnchor: 'end' },   // Left
  ];

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: '100%', maxWidth: `${size}px` }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        className="overflow-visible"
        aria-label="Biểu đồ radar tổng quan năng lực"
        role="img"
      >
        <defs>
          {/* Subtle gradient for the radar fill */}
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity={fillOpacity * 1.5} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={fillOpacity * 0.6} />
          </radialGradient>
        </defs>

        {/* 1. Concentric Diamond Grid Polygons (25, 50, 75, 100) */}
        {GRID_LEVELS.map((level) => {
          const gridValues = Array(totalAxes).fill(level);
          const path = generatePolygonPath(gridValues, cx, cy, radius);
          const isOuter = level === 100;
          return (
            <path
              key={`grid-${level}`}
              d={path}
              fill={isOuter ? 'rgba(248, 250, 252, 0.5)' : 'none'}
              stroke="#e2e8f0"
              strokeWidth={isOuter ? 1.25 : 1}
              strokeDasharray={isOuter ? undefined : '3 3'}
              className="transition-colors"
            />
          );
        })}

        {/* 2. Axis Lines from Center to Outer Vertices */}
        {dimensions.map((_, idx) => {
          const outerPt = getRadarPoint(idx, totalAxes, 1, cx, cy, radius);
          return (
            <line
              key={`axis-${idx}`}
              x1={cx}
              y1={cy}
              x2={outerPt.x}
              y2={outerPt.y}
              stroke="#cbd5e1"
              strokeWidth={1}
            />
          );
        })}

        {/* 3. Grid Level Scale Numbers (along vertical top axis: 25, 50, 75, 100) */}
        {GRID_LEVELS.map((level) => {
          const pt = getRadarPoint(0, totalAxes, level / 100, cx, cy, radius);
          return (
            <text
              key={`scale-${level}`}
              x={cx + 4}
              y={pt.y + 3}
              fontSize="9"
              fill="#94a3b8"
              fontWeight="600"
              fontFamily="monospace"
              className="select-none pointer-events-none"
            >
              {level}
            </text>
          );
        })}

        {/* 4. Filled Data Polygon Area */}
        <path
          d={dataPolygonPath}
          fill={`url(#${gradientId})`}
          stroke={accentColor}
          strokeWidth={2}
          strokeLinejoin="round"
          className="transition-all duration-300 ease-out"
        />

        {/* 5. Data Points (Circles) on Vertices */}
        {dimensions.map((dim, idx) => {
          const val = values[idx];
          const pt = getRadarPoint(idx, totalAxes, val / 100, cx, cy, radius);
          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={`point-${dim.key}`}
              className={interactive ? 'cursor-pointer' : undefined}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Outer halo when hovered */}
              {isHovered && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={8}
                  fill={accentColor}
                  fillOpacity={0.25}
                  className="animate-pulse"
                />
              )}
              {/* Point Circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 5 : 4}
                fill="#ffffff"
                stroke={accentColor}
                strokeWidth={2.5}
                className="transition-all duration-200"
              />
            </g>
          );
        })}

        {/* 6. Vertex Text Labels & Score Badges */}
        {showLabels &&
          dimensions.map((dim, idx) => {
            const outerPt = getRadarPoint(idx, totalAxes, 1, cx, cy, radius);
            const offset = labelOffsets[idx % labelOffsets.length];
            const isHovered = hoveredIndex === idx;
            const score = values[idx];

            return (
              <g
                key={`label-${dim.key}`}
                transform={`translate(${outerPt.x + offset.x}, ${outerPt.y + offset.y})`}
                textAnchor={offset.textAnchor as any}
                className={interactive ? 'cursor-pointer transition-transform' : undefined}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Axis Label */}
                <text
                  x={0}
                  y={-4}
                  fontSize="12"
                  fontWeight={isHovered ? '800' : '650'}
                  fill={isHovered ? accentColor : '#334155'}
                  className="transition-colors"
                >
                  {dim.label}
                </text>
                {/* Axis Score Number */}
                <text
                  x={0}
                  y={12}
                  fontSize="13"
                  fontWeight="800"
                  fontFamily="system-ui, sans-serif"
                  fill={isHovered ? accentColor : score > 0 ? '#1e293b' : '#64748b'}
                  className="transition-colors tabular-nums"
                >
                  {score}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
};

export default CompetencyRadarChart;
