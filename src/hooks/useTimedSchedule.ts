import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function useTimedSchedule() {
  const { checkTimedSchedules } = useAppStore();

  useEffect(() => {
    checkTimedSchedules();

    const interval = setInterval(() => {
      checkTimedSchedules();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkTimedSchedules]);
}
