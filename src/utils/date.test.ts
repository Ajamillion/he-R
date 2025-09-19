import { describe, expect, it } from 'vitest';
import { differenceInDays, formatDateTimeFriendly, getLookbackRange, isValidDateInput, shiftDate } from './date';

describe('date utilities', () => {
  it('shifts ISO date strings by the requested number of days', () => {
    expect(shiftDate('2025-09-20', -2)).toBe('2025-09-18');
    expect(shiftDate('2025-01-01', 1)).toBe('2025-01-02');
  });

  it('builds ascending lookback ranges including the end date', () => {
    expect(getLookbackRange('2025-09-20', 3)).toEqual(['2025-09-18', '2025-09-19', '2025-09-20']);
    expect(getLookbackRange('2025-09-20', 0)).toEqual([]);
  });

  it('formats ISO timestamps into readable month/day and time', () => {
    expect(formatDateTimeFriendly('2025-09-20T14:05:00Z')).toMatch(/Sep/);
    expect(formatDateTimeFriendly('invalid')).toBe('invalid');
  });

  it('validates strict ISO date inputs', () => {
    expect(isValidDateInput('2025-09-20')).toBe(true);
    expect(isValidDateInput('2025-2-05')).toBe(false);
    expect(isValidDateInput('2025-02-30')).toBe(false);
    expect(isValidDateInput(42)).toBe(false);
  });

  it('computes signed day deltas between ISO dates', () => {
    expect(differenceInDays('2025-09-18', '2025-09-20')).toBe(2);
    expect(differenceInDays('2025-09-20', '2025-09-18')).toBe(-2);
  });
});
