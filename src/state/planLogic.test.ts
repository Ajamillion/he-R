import { describe, expect, it } from 'vitest';
import { truthSource } from '../data/truthSource';
import { makeRhythmItemId } from '../utils/rhythm';
import type { PlanProfile, PrecipitatingFactorMap } from '../types';
import {
  createEmptyLog,
  computeTitration,
  evaluateSpacingWarnings,
  summarizeLogsForDates,
  buildPlanExportSnapshot,
  buildPlanExportCsv
} from './planLogic';

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

describe('summarizeLogsForDates', () => {
  it('fills empty days and computes averages across the range', () => {
    const first = createEmptyLog('2025-09-16');
    first.hydration.push(
      { id: 'h1', time: '08:00', ounces: 10 },
      { id: 'h2', time: '10:30', ounces: 8 }
    );
    first.stool.push({ id: 's1', time: '09:00', bristol: 4 });

    const third = createEmptyLog('2025-09-18');
    third.hydration.push({ id: 'h3', time: '12:00', ounces: 16 });
    third.medications.push({ id: 'm1', time: '07:45', name: 'Lactulose', amount: '30 mL' });

    const summary = summarizeLogsForDates([first, third], ['2025-09-16', '2025-09-17', '2025-09-18']);

    expect(summary.days).toBe(3);
    expect(summary.range[1]).toMatchObject({ hydrationOz: 0, stoolCount: 0, medicationCount: 0 });
    expect(summary.hydrationAverageOz).toBeCloseTo((18 + 0 + 16) / 3, 5);
    expect(summary.stoolAverageCount).toBeCloseTo(1 / 3, 5);
    expect(summary.medicationAdherenceRatio).toBeCloseTo(1 / 3, 5);
    expect(summary.topHydrationDay?.date).toBe('2025-09-18');
  });
});

describe('buildPlanExportSnapshot', () => {
  it('produces a sanitized, ordered snapshot of plan data', () => {
    const earlier = createEmptyLog('2025-09-18');
    earlier.hydration.push({ id: 'h1', time: '09:00', ounces: 12 });
    earlier.notes = '  Keep steady  ';
    earlier.rhythmChecklist.push({
      id: makeRhythmItemId('wake', 'Lemon water'),
      time: 'wake',
      task: 'Lemon water',
      completedAt: '2025-09-18T07:05:00Z'
    });

    const later = createEmptyLog('2025-09-19');
    later.hydration.push({ id: 'h2', time: '13:00', ounces: 10 }, { id: 'h3', time: '07:30', ounces: 8 });
    later.stool.push({ id: 's1', time: '08:00', bristol: 4 });
    later.medications.push({ id: 'm1', time: '06:30', name: 'Rifaximin', amount: '550 mg' });
    later.rhythmChecklist.push({
      id: makeRhythmItemId('+20m', 'PHGG 1/4 cap in 12 oz water'),
      time: '+20m',
      task: 'PHGG 1/4 cap in 12 oz water',
      completedAt: '2025-09-19T12:15:00Z'
    });

    const profile: PlanProfile = {
      weightKg: 72,
      hydrationGoalOz: 60,
      regionFlags: Object.fromEntries(
        truthSource.region_flags.map((flag) => [flag, flag === 'rifaximin_available'])
      ),
      lastLabDate: '2025-09-18'
    };

    const factors: PrecipitatingFactorMap = {
      infection: { active: true, note: 'Fever 101°F', updatedAt: '2025-09-19T10:00:00Z' },
      dehydration: { active: false, note: '', updatedAt: undefined }
    };

    const snapshot = buildPlanExportSnapshot({
      logs: [later, earlier],
      profile,
      pegCaps: 0.75,
      lastSyncedAt: '2025-09-19T08:00:00Z',
      truthVersion: truthSource.version,
      factors,
      labCadenceWeeks: truthSource.lab_cadence.weeks,
      now: new Date('2025-09-20T00:00:00Z')
    });

    expect(snapshot.generatedAt).toBe('2025-09-20T00:00:00.000Z');
    expect(snapshot.logs[0].date).toBe('2025-09-18');
    expect(snapshot.logs[0].hydration[0]).toEqual({ time: '09:00', ounces: 12 });
    expect('id' in snapshot.logs[0].hydration[0]).toBe(false);
    expect(snapshot.logs[0].notes).toBe('Keep steady');
    expect(snapshot.logs[1].notes).toBeUndefined();
    expect(snapshot.logs[1].hydration[0]).toEqual({ time: '07:30', ounces: 8 });
    expect(snapshot.logs[1].hydration[1]).toEqual({ time: '13:00', ounces: 10 });
    expect(snapshot.totals).toEqual({
      hydrationEntries: 3,
      stoolEntries: 1,
      medicationEntries: 1,
      rhythmCompletions: 2
    });
    expect(snapshot.profile.regionFlags).not.toBe(profile.regionFlags);
    expect(snapshot.profile.lastLabDate).toBe('2025-09-18');
    expect(snapshot.labCadenceWeeks).toBe(truthSource.lab_cadence.weeks);
    expect(snapshot.precipitatingFactors).toEqual([
      { name: 'dehydration', active: false },
      { name: 'infection', active: true, note: 'Fever 101°F', updatedAt: '2025-09-19T10:00:00Z' }
    ]);
    expect(snapshot.logs[0].rhythmChecklist).toEqual([
      {
        id: makeRhythmItemId('wake', 'Lemon water'),
        time: 'wake',
        task: 'Lemon water',
        completedAt: '2025-09-18T07:05:00Z'
      }
    ]);
    expect(snapshot.logs[1].rhythmChecklist).toEqual([
      {
        id: makeRhythmItemId('+20m', 'PHGG 1/4 cap in 12 oz water'),
        time: '+20m',
        task: 'PHGG 1/4 cap in 12 oz water',
        completedAt: '2025-09-19T12:15:00Z'
      }
    ]);
  });
});

describe('buildPlanExportCsv', () => {
  it('flattens the snapshot into metadata and log rows with escaped values', () => {
    const log = createEmptyLog('2025-09-18');
    log.hydration.push({ id: 'h1', time: '08:00', ounces: 10 });
    log.stool.push({ id: 's1', time: '09:15', bristol: 4 });
    log.medications.push({ id: 'm1', time: '07:00', name: 'Rifaximin', amount: '550 mg' });
    log.notes = 'Focus, steady intake';
    log.rhythmChecklist.push({
      id: makeRhythmItemId('wake', 'Lemon water'),
      time: 'wake',
      task: 'Lemon water',
      completedAt: '2025-09-18T07:05:00Z'
    });

    const profile: PlanProfile = {
      weightKg: 68,
      hydrationGoalOz: 56,
      regionFlags: Object.fromEntries(truthSource.region_flags.map((flag) => [flag, false])),
      lastLabDate: '2025-09-20'
    };

    const factors: PrecipitatingFactorMap = {
      infection: { active: true, note: 'Antibiotics started', updatedAt: '2025-09-18T09:00:00Z' }
    };

    const snapshot = buildPlanExportSnapshot({
      logs: [log],
      profile,
      pegCaps: 0.75,
      lastSyncedAt: undefined,
      truthVersion: truthSource.version,
      factors,
      labCadenceWeeks: truthSource.lab_cadence.weeks,
      now: new Date('2025-09-20T00:00:00Z')
    });

    const csv = buildPlanExportCsv(snapshot);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('Generated at,2025-09-20T00:00:00.000Z,,,,');
    expect(lines).toContain('Date,Time,Category,Item,Amount or Notes');
    expect(lines).toContain('2025-09-18,08:00,Hydration,Hydration,10 oz');
    expect(lines).toContain('2025-09-18,07:00,Medication,Rifaximin,550 mg');
    expect(lines).toContain('2025-09-18,wake,Rhythm,Lemon water,Completed at 2025-09-18T07:05:00Z');
    const notesLine = lines.find((line) => line.startsWith('2025-09-18,,Notes'));
    expect(notesLine).toBe('2025-09-18,,Notes,Care note,"Focus, steady intake"');
    const regionLine = lines.find((line) => line.startsWith('Region flags enabled'));
    expect(regionLine?.startsWith('Region flags enabled,None')).toBe(true);
    const cadenceLine = lines.find((line) => line.startsWith('Lab cadence (weeks)'));
    expect(cadenceLine).toBe('Lab cadence (weeks),8,,,,');
    const checklistLine = lines.find((line) => line.startsWith('Daily rhythm completions'));
    expect(checklistLine).toBe('Daily rhythm completions,1,,,,');
    const lastLabsLine = lines.find((line) => line.startsWith('Last labs recorded'));
    expect(lastLabsLine).toBe('Last labs recorded,2025-09-20,,,,');
    const nextLabsLine = lines.find((line) => line.startsWith('Next labs due'));
    expect(nextLabsLine).toBe('Next labs due,2025-11-15,,,,');
    const statusLine = lines.find((line) => line.startsWith('Lab timing status'));
    expect(statusLine).toBe('Lab timing status,Due in 56 days,,,,');
    const factorHeader = lines.findIndex((line) => line === 'Precipitating factor,Status,Last updated,Notes,');
    expect(factorHeader).toBeGreaterThan(-1);
    expect(lines[factorHeader + 1]).toContain('infection,Active,2025-09-18T09:00:00Z,Antibiotics started,');
  });
});
