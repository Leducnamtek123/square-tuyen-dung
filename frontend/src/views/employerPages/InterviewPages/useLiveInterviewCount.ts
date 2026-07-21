'use client';

import { useEffect, useState } from 'react';

import interviewService from '@/services/interviewService';
import { countLiveInterviewSessions } from './liveInterviewSessions';

const LIVE_INTERVIEW_COUNT_REFRESH_MS = 10_000;

export const useLiveInterviewCount = () => {
  const [liveInterviewCount, setLiveInterviewCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadLiveInterviewCount = async () => {
      try {
        const data = await interviewService.getSessions({
          pageSize: 200,
          ordering: '-create_at',
        });

        if (mounted) {
          setLiveInterviewCount(countLiveInterviewSessions(data.results || []));
        }
      } catch (error) {
        console.error('Error fetching live interview count', error);
        if (mounted) {
          setLiveInterviewCount(0);
        }
      }
    };

    loadLiveInterviewCount();
    const intervalId = window.setInterval(loadLiveInterviewCount, LIVE_INTERVIEW_COUNT_REFRESH_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return liveInterviewCount;
};
