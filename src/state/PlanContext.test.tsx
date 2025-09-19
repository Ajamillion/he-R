import { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { PlanProvider, usePlan } from './PlanContext';

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
});
