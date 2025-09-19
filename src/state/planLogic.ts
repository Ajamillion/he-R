import type { TruthSource } from '../data/truthSource';
import type { DailyLog, MedicationDose, PegTitration } from '../types';

const normalizeName = (value: string) => value.toLowerCase();

const tokenize = (value: string) =>
  value
    .split(/[\//,&]/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const createEmptyLog = (date: string): DailyLog => ({
  date,
  hydration: [],
  stool: [],
  medications: [],
  notes: ''
});

type EnsureLogResult = {
  logs: DailyLog[];
  log: DailyLog;
};

export const ensureLogExists = (logs: DailyLog[], date: string): EnsureLogResult => {
  const found = logs.find((log) => log.date === date);
  if (found) {
    return {
      logs,
      log: {
        ...found,
        hydration: [...found.hydration],
        stool: [...found.stool],
        medications: [...found.medications]
      }
    };
  }

  const newLog = createEmptyLog(date);
  return {
    logs: [...logs, newLog].sort((a, b) => {
      if (a.date === b.date) return 0;
      return a.date > b.date ? -1 : 1;
    }),
    log: newLog
  };
};

export const computeTitration = (
  log: DailyLog,
  currentCaps: number,
  settings: TruthSource['titration']['peg_3350']
): PegTitration => {
  const stoolCount = log.stool.length;
  const { step_cap, min_caps, max_caps } = settings;

  if (stoolCount > 3) {
    return {
      currentCaps,
      recommendation: 'decrease',
      suggestedDelta: Math.max(min_caps, currentCaps - step_cap) - currentCaps
    };
  }

  if (stoolCount < 2) {
    return {
      currentCaps,
      recommendation: 'increase',
      suggestedDelta: Math.min(max_caps, currentCaps + step_cap) - currentCaps
    };
  }

  return {
    currentCaps,
    recommendation: 'hold',
    suggestedDelta: 0
  };
};

const includesName = (name: string, tokens: string[]) => tokens.some((token) => normalizeName(name).includes(token));

const checkAgainst = (
  entries: MedicationDose[],
  tokens: string[],
  referenceMinutes: number,
  minMinutes: number,
  incomingName: string,
  relatedName: string,
  warnings: string[]
) => {
  entries.forEach((entry) => {
    if (includesName(entry.name, tokens)) {
      const diff = Math.abs(referenceMinutes - timeToMinutes(entry.time));
      if (diff < minMinutes) {
        warnings.push(
          `${incomingName} is within ${minMinutes - diff} minutes of ${entry.name}. Keep at least ${minMinutes} minutes between ${relatedName}.`
        );
      }
    }
  });
};

export const evaluateSpacingWarnings = (
  logs: DailyLog[],
  date: string,
  incomingName: string,
  time: string,
  spacingRules: TruthSource['spacing_rules']
): string[] => {
  const log = logs.find((item) => item.date === date);
  if (!log) {
    return [];
  }

  const minutes = timeToMinutes(time);
  const warnings: string[] = [];

  spacingRules.forEach((rule) => {
    const tokensA = tokenize(rule.a);
    const tokensB = tokenize(rule.b);

    if (includesName(incomingName, tokensA)) {
      checkAgainst(log.medications, tokensB, minutes, rule.min_minutes, incomingName, `${rule.a} and ${rule.b}`, warnings);
    }

    if (includesName(incomingName, tokensB)) {
      checkAgainst(log.medications, tokensA, minutes, rule.min_minutes, incomingName, `${rule.a} and ${rule.b}`, warnings);
    }
  });

  return Array.from(new Set(warnings));
};
