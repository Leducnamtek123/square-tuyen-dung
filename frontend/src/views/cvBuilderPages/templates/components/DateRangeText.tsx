import React from 'react';
import { CVLanguage, getCVLabels } from '../utils/cvDictionary';

interface DateRangeTextProps {
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  language?: CVLanguage;
  className?: string;
  style?: React.CSSProperties;
}

export const DateRangeText: React.FC<DateRangeTextProps> = ({
  startDate,
  endDate,
  isCurrent,
  language = 'vi',
  className = '',
  style,
}) => {
  const labels = getCVLabels(language);

  if (!startDate && !endDate && !isCurrent) {
    return null;
  }

  const endText = isCurrent ? labels.present : endDate || '';

  let displayText = '';
  if (startDate && endText) {
    displayText = `${startDate} – ${endText}`;
  } else if (startDate) {
    displayText = startDate;
  } else if (endText) {
    displayText = endText;
  }

  return (
    <span className={className} style={style}>
      {displayText}
    </span>
  );
};
