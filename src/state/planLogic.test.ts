import { describe, expect, it } from 'vitest';
import { truthSource } from '../data/truthSource';
import { createEmptyLog, computeTitration, evaluateSpacingWarnings } from './planLogic';

describe('computeTitration', () => {
  it('recommends increasing PEG caps when stool count is below target', () => {
    const log = createEmptyLog('2025-09-18');
    log.stool.push({ id: 's1', time: '08:00', bristol: 3 });

    const result = computeTitration(log, 0.5, truthSource.titration.peg_3350);

    expect(result.recommendation).toBe('increase');
    expect(result.suggestedDelta).toBeGreaterThan(0);
  });

  it('recommends decreasing PEG caps when stool count exceeds target', () => {
    const log = createEmptyLog('2025-09-18');
    log.stool.push(
      { id: 's1', time: '07:00', bristol: 4 },
      { id: 's2', time: '11:00', bristol: 5 },
      { id: 's3', time: '15:00', bristol: 6 },
      { id: 's4', time: '19:00', bristol: 6 }
    );

    const result = computeTitration(log, 1.25, truthSource.titration.peg_3350);

    expect(result.recommendation).toBe('decrease');
    expect(result.suggestedDelta).toBeLessThan(0);
  });

  it('holds steady when stool count is within the target range', () => {
    const log = createEmptyLog('2025-09-18');
    log.stool.push(
      { id: 's1', time: '09:00', bristol: 4 },
      { id: 's2', time: '18:00', bristol: 4 }
    );

    const result = computeTitration(log, 0.75, truthSource.titration.peg_3350);

    expect(result.recommendation).toBe('hold');
    expect(result.suggestedDelta).toBe(0);
  });
});

describe('evaluateSpacingWarnings', () => {
  it('flags dosing events that violate spacing rules', () => {
    const log = createEmptyLog('2025-09-18');
    log.medications.push({ id: 'm1', time: '08:00', name: 'PHGG fiber', amount: '' });
    const logs = [log];

    const warnings = evaluateSpacingWarnings(
      logs,
      '2025-09-18',
      'PEG 3350',
      '08:30',
      truthSource.spacing_rules
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/Keep at least 60 minutes/);
  });

  it('returns no warnings when spacing rules are respected', () => {
    const log = createEmptyLog('2025-09-18');
    log.medications.push({ id: 'm1', time: '07:00', name: 'Zinc supplement', amount: '' });
    const logs = [log];

    const warnings = evaluateSpacingWarnings(
      logs,
      '2025-09-18',
      'Greek yogurt',
      '09:30',
      truthSource.spacing_rules
    );

    expect(warnings).toHaveLength(0);
  });
});
