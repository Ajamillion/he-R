import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { PlanProvider, usePlan } from './PlanContext';
import { makeRhythmItemId } from '../utils/rhythm';

type WrapperProps = {
  children: ReactNode;
};

const wrapper = ({ children }: WrapperProps) => <PlanProvider>{children}</PlanProvider>;

describe('PlanProvider log management', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('removes hydration entries and prunes empty logs', () => {
    const { result } = renderHook(() => usePlan(), { wrapper });
    const date = '2025-09-18';

    act(() => {
      result.current.addHydration(date, { time: '08:00', ounces: 8 });
    });

    const hydrationId = result.current.logs.find((log) => log.date === date)?.hydration[0]?.id;
    expect(hydrationId).toBeDefined();

    act(() => {
      if (hydrationId) {
        result.current.removeHydration(date, hydrationId);
      }
    });

    expect(result.current.logs.find((log) => log.date === date)).toBeUndefined();
  });

  it('drops empty logs when notes are cleared', () => {
    const { result } = renderHook(() => usePlan(), { wrapper });
    const date = '2025-09-19';

    act(() => {
      result.current.updateNotes(date, 'Remember zinc after lunch');
    });

    expect(result.current.logs.find((log) => log.date === date)?.notes).toBe(
      'Remember zinc after lunch'
    );

    act(() => {
      result.current.updateNotes(date, '');
    });

    expect(result.current.logs.find((log) => log.date === date)).toBeUndefined();
  });

  it('tracks daily rhythm checklist completions and removes empty logs after clearing', () => {
    const { result } = renderHook(() => usePlan(), { wrapper });
    const date = '2025-09-21';
    const task = { id: makeRhythmItemId('wake', 'Lemon water'), time: 'wake', task: 'Lemon water' };

    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2025-09-21T07:05:00Z'));
      act(() => {
        result.current.setRhythmCompletion(date, task, true);
      });

      const log = result.current.logs.find((entry) => entry.date === date);
      expect(log?.rhythmChecklist).toHaveLength(1);
      expect(log?.rhythmChecklist[0]).toMatchObject({
        id: task.id,
        time: task.time,
        task: task.task,
        completedAt: '2025-09-21T07:05:00.000Z'
      });

      act(() => {
        result.current.setRhythmCompletion(date, task, false);
      });
    } finally {
      vi.useRealTimers();
    }

    expect(result.current.logs.find((entry) => entry.date === date)).toBeUndefined();
  });
});

describe('PlanProvider precipitating factor tracker', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('updates factor activity and notes with timestamps', () => {
    const { result } = renderHook(() => usePlan(), { wrapper });
    const factorName = Object.keys(result.current.factors)[0];
    expect(factorName).toBeDefined();

    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2025-09-20T09:00:00Z'));

      act(() => {
        result.current.setFactorActive(factorName, true);
      });

      expect(result.current.factors[factorName].active).toBe(true);
      expect(result.current.factors[factorName].updatedAt).toBe('2025-09-20T09:00:00.000Z');

      vi.setSystemTime(new Date('2025-09-20T10:15:00Z'));

      act(() => {
        result.current.setFactorNote(factorName, '  Elevated ammonia  ');
      });

      expect(result.current.factors[factorName].note).toBe('Elevated ammonia');
      expect(result.current.factors[factorName].updatedAt).toBe('2025-09-20T10:15:00.000Z');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('PlanProvider lab cadence tracking', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists valid lab dates and ignores invalid updates', () => {
    const { result } = renderHook(() => usePlan(), { wrapper });

    act(() => {
      result.current.setLastLabDate('2025-09-18');
    });

    expect(result.current.profile.lastLabDate).toBe('2025-09-18');

    act(() => {
      result.current.setLastLabDate('2025-02-30');
    });

    expect(result.current.profile.lastLabDate).toBe('2025-09-18');

    act(() => {
      result.current.setLastLabDate(undefined);
    });

    expect(result.current.profile.lastLabDate).toBeUndefined();
  });
});
