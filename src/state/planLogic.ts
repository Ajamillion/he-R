import type { TruthSource } from '../data/truthSource';
import type { DailyLog, MedicationDose, PegTitration, PlanProfile } from '../types';

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

export type LogDaySummary = {
  date: string;
  hydrationOz: number;
  stoolCount: number;
  medicationCount: number;
};

export type LookbackSummary = {
  days: number;
  range: LogDaySummary[];
  hydrationAverageOz: number;
  stoolAverageCount: number;
  medicationAdherenceRatio: number;
  topHydrationDay?: LogDaySummary;
};

export const summarizeLogsForDates = (logs: DailyLog[], dates: string[]): LookbackSummary => {
  if (dates.length === 0) {
    return {
      days: 0,
      range: [],
      hydrationAverageOz: 0,
      stoolAverageCount: 0,
      medicationAdherenceRatio: 0,
      topHydrationDay: undefined
    };
  }

  const logMap = new Map(logs.map((log) => [log.date, log]));
  const range = dates.map<LogDaySummary>((date) => {
    const log = logMap.get(date);
    if (!log) {
      return { date, hydrationOz: 0, stoolCount: 0, medicationCount: 0 };
    }
    const hydrationOz = log.hydration.reduce((sum, entry) => sum + entry.ounces, 0);
    return {
      date,
      hydrationOz,
      stoolCount: log.stool.length,
      medicationCount: log.medications.length
    };
  });

  let topHydrationDay: LogDaySummary | undefined;
  const totals = range.reduce(
    (acc, day) => {
      if (!topHydrationDay || day.hydrationOz > topHydrationDay.hydrationOz) {
        topHydrationDay = day;
      } else if (
        topHydrationDay &&
        day.hydrationOz === topHydrationDay.hydrationOz &&
        day.date > topHydrationDay.date
      ) {
        topHydrationDay = day;
      }

      return {
        hydration: acc.hydration + day.hydrationOz,
        stool: acc.stool + day.stoolCount,
        medicationDays: acc.medicationDays + (day.medicationCount > 0 ? 1 : 0)
      };
    },
    { hydration: 0, stool: 0, medicationDays: 0 }
  );

  const days = range.length;

  return {
    days,
    range,
    hydrationAverageOz: days > 0 ? totals.hydration / days : 0,
    stoolAverageCount: days > 0 ? totals.stool / days : 0,
    medicationAdherenceRatio: days > 0 ? totals.medicationDays / days : 0,
    topHydrationDay
  };
};

const sortByTime = <T extends { time: string }>(entries: T[]) =>
  [...entries].sort((a, b) => a.time.localeCompare(b.time));

export type PlanExportSnapshot = {
  generatedAt: string;
  truthVersion: string;
  profile: PlanProfile;
  pegCaps: number;
  lastSyncedAt?: string;
  totals: {
    hydrationEntries: number;
    stoolEntries: number;
    medicationEntries: number;
  };
  logs: {
    date: string;
    hydration: { time: string; ounces: number }[];
    stool: { time: string; bristol: number }[];
    medications: { time: string; name: string; amount: string }[];
    notes?: string;
  }[];
};

type PlanExportOptions = {
  logs: DailyLog[];
  profile: PlanProfile;
  pegCaps: number;
  lastSyncedAt?: string;
  truthVersion: string;
  now?: Date;
};

const sortLogsByDate = (a: DailyLog, b: DailyLog) => {
  if (a.date === b.date) return 0;
  return a.date < b.date ? -1 : 1;
};

export const buildPlanExportSnapshot = ({
  logs,
  profile,
  pegCaps,
  lastSyncedAt,
  truthVersion,
  now = new Date()
}: PlanExportOptions): PlanExportSnapshot => {
  const sanitizedLogs = logs
    .slice()
    .sort(sortLogsByDate)
    .map((log) => {
      const hydration = sortByTime(log.hydration).map(({ id, ...rest }) => rest);
      const stool = sortByTime(log.stool).map(({ id, ...rest }) => rest);
      const medications = sortByTime(log.medications).map(({ id, ...rest }) => rest);
      const trimmedNotes = log.notes.trim();
      return {
        date: log.date,
        hydration,
        stool,
        medications,
        ...(trimmedNotes ? { notes: trimmedNotes } : {})
      };
    });

  const totals = sanitizedLogs.reduce(
    (acc, log) => ({
      hydrationEntries: acc.hydrationEntries + log.hydration.length,
      stoolEntries: acc.stoolEntries + log.stool.length,
      medicationEntries: acc.medicationEntries + log.medications.length
    }),
    { hydrationEntries: 0, stoolEntries: 0, medicationEntries: 0 }
  );

  return {
    generatedAt: now.toISOString(),
    truthVersion,
    profile: {
      weightKg: profile.weightKg,
      hydrationGoalOz: profile.hydrationGoalOz,
      regionFlags: { ...profile.regionFlags }
    },
    pegCaps,
    lastSyncedAt,
    totals,
    logs: sanitizedLogs
  };
};

const escapeCsvValue = (value: string) => {
  if (value.length === 0) {
    return '';
  }
  const shouldQuote = /[",\n\r]/.test(value);
  const normalized = value.replace(/"/g, '""');
  return shouldQuote ? `"${normalized}"` : normalized;
};

const joinRow = (columns: string[]) => columns.map(escapeCsvValue).join(',');

const formatRegionFlag = (flag: string) => flag.replace(/_/g, ' ');

export const buildPlanExportCsv = (snapshot: PlanExportSnapshot): string => {
  const rows: string[][] = [];

  const enabledRegions = Object.entries(snapshot.profile.regionFlags)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([flag]) => formatRegionFlag(flag));

  const regionSummary = enabledRegions.length > 0 ? enabledRegions.join('; ') : 'None';

  rows.push(['Generated at', snapshot.generatedAt, '', '', '']);
  rows.push(['Truth version', snapshot.truthVersion, '', '', '']);
  rows.push(['Last synced at', snapshot.lastSyncedAt ?? 'Not yet synced', '', '', '']);
  rows.push(['PEG 3350 caps', snapshot.pegCaps.toString(), '', '', '']);
  rows.push(['Body weight (kg)', snapshot.profile.weightKg.toString(), '', '', '']);
  rows.push(['Hydration goal (oz)', snapshot.profile.hydrationGoalOz.toString(), '', '', '']);
  rows.push(['Region flags enabled', regionSummary, '', '', '']);
  rows.push(['', '', '', '', '']);
  rows.push(['Date', 'Time', 'Category', 'Item', 'Amount or Notes']);

  snapshot.logs.forEach((log) => {
    log.hydration.forEach((entry) => {
      rows.push([log.date, entry.time, 'Hydration', 'Hydration', `${entry.ounces} oz`]);
    });

    log.stool.forEach((entry) => {
      rows.push([log.date, entry.time, 'Stool', `Bristol ${entry.bristol}`, `Type ${entry.bristol}`]);
    });

    log.medications.forEach((entry) => {
      rows.push([log.date, entry.time, 'Medication', entry.name, entry.amount]);
    });

    if (log.notes) {
      rows.push([log.date, '', 'Notes', 'Care note', log.notes]);
    }
  });

  return rows.map((row) => joinRow(row)).join('\n');
};
