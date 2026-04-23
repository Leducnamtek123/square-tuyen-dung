import React from 'react';
import { View } from './pdf';

export const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getFullYear()}`;
};

type LanguageLevelDotsProps = {
  level?: string | number;
  levelDot?: any;
  levelDotEmpty?: any;
};

export const LanguageLevelDots = ({ level, levelDot, levelDotEmpty }: LanguageLevelDotsProps) => {
  const dotLabels = ['one', 'two', 'three', 'four', 'five'] as const;

  return (
    <>
      {dotLabels.map((dotLabel, index) => (
        <View
          key={`level-dot-${dotLabel}`}
          style={index < Number(level) ? levelDot : levelDotEmpty}
        />
      ))}
    </>
  );
};
