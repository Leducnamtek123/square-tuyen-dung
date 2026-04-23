import React from 'react';
import { View } from '@react-pdf/renderer';

export const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getFullYear()}`;
};

export const renderLanguageLevel = (level?: string | number, levelDot?: any, levelDotEmpty?: any) => {
  const maxLevel = 5;
  const dots = [];

  for (let i = 0; i < maxLevel; i++) {
    dots.push(<View key={`level-dot-${i}`} style={i < Number(level) ? levelDot : levelDotEmpty} />);
  }

  return dots;
};
