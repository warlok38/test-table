import { useEffect, useRef, useState, useCallback } from "react";

interface UseFormTimerProps {
  delayBeforeCounter?: number;
  countdownDuration?: number;
  onCountdownEnd?: () => void;
}

interface UseFormTimerReturn {
  showCounter: boolean;
  counter: number;
  counterPercent: number;
  startTimer: () => void;
  resetTimer: () => void;
}

export const useFormTimer = ({
  delayBeforeCounter = 5,
  countdownDuration = 10,
  onCountdownEnd,
}: UseFormTimerProps): UseFormTimerReturn => {
  const [showCounter, setShowCounter] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const [counterPercent, setCounterPercent] = useState<number>(0);

  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const calculatePercent = useCallback(
    (current: number, total: number): number => {
      return (current / total) * 100;
    },
    []
  );

  const startTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setShowCounter(false);
    setCounterPercent(100);

    timeoutRef.current = setTimeout(() => {
      setShowCounter(true);
      setCounter(countdownDuration);
      setCounterPercent(calculatePercent(countdownDuration, countdownDuration));

      intervalRef.current = setInterval(() => {
        setCounter((prev) => {
          const newCounter = prev - 0.1;
          const newPercent = calculatePercent(newCounter, countdownDuration);
          setCounterPercent(newPercent);

          if (newCounter <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setShowCounter(false);
            onCountdownEnd?.();
            return 0;
          }

          return Number(newCounter.toFixed(1));
        });
      }, 100);
    }, delayBeforeCounter * 1000);
  }, [delayBeforeCounter, countdownDuration, onCountdownEnd, calculatePercent]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setShowCounter(false);
    setCounterPercent(100);
  }, []);

  useEffect(() => {
    return () => {
      resetTimer();
    };
  }, [resetTimer]);

  return {
    showCounter,
    counter: Math.ceil(counter),
    counterPercent,
    startTimer,
    resetTimer,
  };
};
