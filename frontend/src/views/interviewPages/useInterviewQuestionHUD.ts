import { useState, useEffect, useCallback, useRef } from 'react';
import type { Question } from '@/types/models';

export const QUESTION_CHANGE_TOPIC = 'square.interview.question_change';
export const QUESTION_CONTROL_TOPIC = 'square.interview.question_control';
export const PROCTORING_TOPIC = 'square.interview.proctoring';

export interface QuestionHUDState {
  questions: Question[];
  currentIndex: number;
  totalQuestions: number;
  currentQuestion: Question | null;
  remainingSeconds: number;
  initialSeconds: number;
  progressPercent: number;
  isTimerRunning: boolean;
  isLowTime: boolean;
  formattedTime: string;
  hintsDrawerOpen: boolean;
  roadmapDrawerOpen: boolean;
  completedQuestionIds: Set<number>;
}

export interface QuestionHUDActions {
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  extendTime: (seconds?: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setHintsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRoadmapDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  markQuestionCompleted: (questionId: number) => void;
}

export interface UseInterviewQuestionHUDOptions {
  initialQuestions?: Question[];
  defaultDurationSeconds?: number;
  room?: any;
  onQuestionChange?: (index: number, question: Question | null) => void;
  onTimeUp?: (index: number) => void;
  onCompleteInterview?: () => void;
}

export function formatSecondsToTime(totalSec: number): string {
  if (totalSec < 0) totalSec = 0;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function useInterviewQuestionHUD(options: UseInterviewQuestionHUDOptions = {}) {
  const {
    initialQuestions = [],
    defaultDurationSeconds = 120,
    room,
    onQuestionChange,
    onTimeUp,
    onCompleteInterview,
  } = options;

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [hintsDrawerOpen, setHintsDrawerOpen] = useState<boolean>(false);
  const [roadmapDrawerOpen, setRoadmapDrawerOpen] = useState<boolean>(false);
  const [completedQuestionIds, setCompletedQuestionIds] = useState<Set<number>>(new Set());

  // Update questions if initialQuestions change
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  const currentQuestion = questions[currentIndex] || null;
  const questionDuration = currentQuestion?.default_duration_seconds || defaultDurationSeconds;

  const [initialSeconds, setInitialSeconds] = useState<number>(questionDuration);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(questionDuration);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Sync timer when question changes
  const prevIndexRef = useRef<number>(currentIndex);
  const onTimeUpFiredRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      const dur = questions[currentIndex]?.default_duration_seconds || defaultDurationSeconds;
      setInitialSeconds(dur);
      setRemainingSeconds(dur);
      setIsTimerRunning(true);
      onTimeUpFiredRef.current = null;
      prevIndexRef.current = currentIndex;
      onQuestionChange?.(currentIndex, questions[currentIndex] || null);
    }
  }, [currentIndex, questions, defaultDurationSeconds, onQuestionChange]);

  const broadcastTimeUp = useCallback(
    (index: number) => {
      if (!room || !room.localParticipant) return;
      try {
        const payload = JSON.stringify({
          action: 'time_up',
          question_index: index,
        });
        room.localParticipant.sendText(payload, {
          topic: QUESTION_CONTROL_TOPIC,
        });
      } catch (err) {
        console.warn('[HUD] Failed to broadcast time_up:', err);
      }
    },
    [room]
  );

  // Countdown interval
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const markQuestionCompleted = useCallback((id: number) => {
    setCompletedQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const broadcastQuestionChange = useCallback(
    (index: number) => {
      if (!room || !room.localParticipant) return;
      try {
        const q = questions[index];
        const payload = JSON.stringify({
          question_index: index,
          question_id: q?.id,
          question_text: q?.text,
          duration_seconds: q?.default_duration_seconds || defaultDurationSeconds,
        });
        room.localParticipant.sendText(payload, {
          topic: QUESTION_CHANGE_TOPIC,
        });
      } catch (err) {
        console.warn('[HUD] Failed to broadcast question change:', err);
      }
    },
    [room, questions, defaultDurationSeconds]
  );

  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) return;
      if (currentQuestion?.id) {
        markQuestionCompleted(currentQuestion.id);
      }
      setCurrentIndex(index);
      broadcastQuestionChange(index);
    },
    [questions.length, currentQuestion, markQuestionCompleted, broadcastQuestionChange]
  );

  // When timer reaches 0, trigger time_up transition
  useEffect(() => {
    if (questions.length === 0) return;
    if (remainingSeconds === 0 && isTimerRunning && onTimeUpFiredRef.current !== currentIndex) {
      onTimeUpFiredRef.current = currentIndex;
      setIsTimerRunning(false);
      broadcastTimeUp(currentIndex);
      onTimeUp?.(currentIndex);

      const fallbackTimer = setTimeout(() => {
        if (onTimeUpFiredRef.current === currentIndex) {
          if (currentIndex < questions.length - 1) {
            goToQuestion(currentIndex + 1);
          } else {
            onCompleteInterview?.();
          }
        }
      }, 7000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [questions.length, remainingSeconds, isTimerRunning, currentIndex, broadcastTimeUp, onTimeUp, goToQuestion, onCompleteInterview]);

  const nextQuestion = useCallback(() => {
    if (questions.length === 0) return;
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
      if (room?.localParticipant) {
        try {
          room.localParticipant.sendText(
            JSON.stringify({ action: 'next_question', question_index: currentIndex + 1 }),
            { topic: QUESTION_CONTROL_TOPIC }
          );
        } catch (err) {
          console.warn('[HUD] Failed to broadcast next_question:', err);
        }
      }
    } else {
      if (room?.localParticipant) {
        try {
          room.localParticipant.sendText(
            JSON.stringify({ action: 'finish_interview' }),
            { topic: QUESTION_CONTROL_TOPIC }
          );
        } catch (err) {
          console.warn('[HUD] Failed to broadcast finish_interview:', err);
        }
      }
      onCompleteInterview?.();
    }
  }, [currentIndex, questions.length, goToQuestion, room, onCompleteInterview]);

  const previousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }, [currentIndex, goToQuestion]);

  const extendTime = useCallback((seconds = 30) => {
    setRemainingSeconds((prev) => prev + seconds);
    setInitialSeconds((prev) => prev + seconds);
  }, []);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    const dur = currentQuestion?.default_duration_seconds || defaultDurationSeconds;
    setInitialSeconds(dur);
    setRemainingSeconds(dur);
    setIsTimerRunning(true);
  }, [currentQuestion, defaultDurationSeconds]);

  // Listen to remote question changes from LiveKit data channel
  useEffect(() => {
    if (!room || typeof room.registerTextStreamHandler !== 'function') return;

    const handleRemoteChange = async (reader: { readAll: () => Promise<string> }) => {
      try {
        const text = await reader.readAll();
        const data = JSON.parse(text);
        if (typeof data.question_index === 'number' && data.question_index !== currentIndex) {
          setCurrentIndex(data.question_index);
        }
      } catch (err) {
        console.warn('[HUD] Error parsing remote question event:', err);
      }
    };

    const handleRemoteControl = async (reader: { readAll: () => Promise<string> }) => {
      try {
        const text = await reader.readAll();
        const data = JSON.parse(text);
        if (
          data.action === 'question_advanced' &&
          typeof data.question_index === 'number' &&
          data.question_index !== currentIndex
        ) {
          setCurrentIndex(data.question_index);
        } else if (data.action === 'session_completed') {
          setTimeout(() => {
            onCompleteInterview?.();
          }, 3500);
        }
      } catch (err) {
        console.warn('[HUD] Error parsing remote question control event:', err);
      }
    };

    try {
      room.registerTextStreamHandler(QUESTION_CHANGE_TOPIC, handleRemoteChange);
    } catch {
      // Ignore register failure
    }

    try {
      room.registerTextStreamHandler(QUESTION_CONTROL_TOPIC, handleRemoteControl);
    } catch {
      // Ignore register failure
    }

    return () => {
      try {
        if (typeof room.unregisterTextStreamHandler === 'function') {
          room.unregisterTextStreamHandler(QUESTION_CHANGE_TOPIC);
          room.unregisterTextStreamHandler(QUESTION_CONTROL_TOPIC);
        }
      } catch {
        // Ignore
      }
    };
  }, [room, currentIndex]);

  const isLowTime = remainingSeconds <= 20;
  const progressPercent = initialSeconds > 0 ? Math.min(100, Math.max(0, (remainingSeconds / initialSeconds) * 100)) : 0;
  const formattedTime = formatSecondsToTime(remainingSeconds);

  return {
    questions,
    currentIndex,
    totalQuestions: questions.length,
    currentQuestion,
    remainingSeconds,
    initialSeconds,
    progressPercent,
    isTimerRunning,
    isLowTime,
    formattedTime,
    hintsDrawerOpen,
    roadmapDrawerOpen,
    completedQuestionIds,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    extendTime,
    toggleTimer,
    resetTimer,
    setHintsDrawerOpen,
    setRoadmapDrawerOpen,
    markQuestionCompleted,
  };
}
