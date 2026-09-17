'use client';

import React, { useEffect, useState } from 'react';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface InterviewRecordingBadgeProps {
  startTime?: Date | string | number;
  className?: string;
  isRecording?: boolean;
}

/**
 * Component hiển thị trạng thái đang quay lại / ghi hình cuộc họp kèm bộ đếm thời gian
 * Bám sát thiết kế pill badge với icon vòng tròn đỏ đồng tâm và font số monospaced điện tử:
 * [ 🔘 02:00 ]
 */
export const InterviewRecordingBadge: React.FC<InterviewRecordingBadgeProps> = ({
  startTime,
  className = '',
  isRecording = true,
}) => {
  const { t } = useTranslation(['interview']);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const computeElapsed = () => {
      if (startTime) {
        const start = new Date(startTime).getTime();
        const now = Date.now();
        return Math.max(0, Math.floor((now - start) / 1000));
      }
      return 0;
    };

    setElapsedSeconds(computeElapsed());

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const tooltipText = t(
    'recordingBadge.tooltip',
    'Cuộc họp đang được tự động ghi hình để phục vụ đánh giá năng lực chuyên môn & đối soát'
  );

  return (
    <Tooltip title={tooltipText} arrow placement="bottom">
      <div
        data-tour="interview-recording"
        role="status"
        aria-label={t('recordingBadge.ariaLabel', 'Cuộc họp đang được ghi hình')}
        className={`inline-flex items-center gap-1.5 rounded-full border border-rose-200/90 bg-rose-50/90 px-2.5 py-0.5 shadow-2xs backdrop-blur-md transition-all hover:border-rose-300 hover:bg-rose-100/70 select-none ${className}`}
      >
        {/* Icon ghi hình: vòng tròn đỏ đồng tâm theo ảnh mẫu */}
        <span className="relative flex h-3.5 w-3.5 items-center justify-center">
          {isRecording && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500/35 opacity-75 duration-1000" />
          )}
          <svg
            viewBox="0 0 24 24"
            className="relative h-3.5 w-3.5 text-rose-500 transition-colors"
            fill="none"
            stroke="currentColor"
          >
            {/* Vòng ngoài */}
            <circle cx="12" cy="12" r="9.5" strokeWidth="2.2" />
            {/* Chấm tròn trong */}
            <circle cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" />
          </svg>
        </span>

        {/* Bộ đếm thời gian dạng đồng hồ kỹ thuật số monospaced */}
        <span className="font-mono text-xs font-bold tracking-wider text-rose-700 tabular-nums">
          {formatTime(elapsedSeconds)}
        </span>
      </div>
    </Tooltip>
  );
};

export default InterviewRecordingBadge;
