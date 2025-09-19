import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect
} from 'react';
import { truthSource } from '../data/truthSource';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type {
  CloudSyncState,
  DailyLog,
  HydrationEntry,
  MedicationDose,
  PegTitration,
  PlanProfile,
  StoolEntry
} from '../types';
import { createEmptyLog, ensureLogExists, computeTitration, evaluateSpacingWarnings } from './planLogic';

const STORAGE_KEY = 'her-plan-store';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const createDefaultProfile = (): PlanProfile => ({
  weightKg: 70,
  hydrationGoalOz: truthSource.targets.hydration_oz_day.default,
  regionFlags: Object.fromEntries(truthSource.region_flags.map((flag) => [flag, false]))
});

const mergeProfile = (profile?: PlanProfile): PlanProfile => {
  const defaults = createDefaultProfile();
  if (!profile) {
    return defaults;
  }

  const { min, max } = truthSource.targets.hydration_oz_day;
  const weightKg = Number.isFinite(profile.weightKg) ? clamp(profile.weightKg, 30, 150) : defaults.weightKg;
  const hydrationGoalOz = Number.isFinite(profile.hydrationGoalOz)
    ? clamp(profile.hydrationGoalOz, min, max)
    : defaults.hydrationGoalOz;
  const normalizedFlags = {
    ...defaults.regionFlags,
    ...Object.fromEntries(
      Object.entries(profile.regionFlags ?? {}).map(([flag, value]) => [flag, Boolean(value)])
    )
  };

  const regionChanged = Object.keys(normalizedFlags).some(
    (flag) => normalizedFlags[flag] !== (profile.regionFlags ?? {})[flag]
  );

  if (!regionChanged && weightKg === profile.weightKg && hydrationGoalOz === profile.hydrationGoalOz) {
    return profile;
  }

  return {
    weightKg,
    hydrationGoalOz,
    regionFlags: normalizedFlags
  };
};

type PlanStorage = {
  logs: DailyLog[];
  pegCaps: number;
  profile?: PlanProfile;
};

const defaultStorage: PlanStorage = {
  logs: [],
  pegCaps: 0.5,
  profile: createDefaultProfile()
};

type PlanContextValue = {
  logs: DailyLog[];
  getLogByDate: (date: string) => DailyLog;
  addHydration: (date: string, entry: Omit<HydrationEntry, 'id'>) => { warnings: string[] };
  addStool: (date: string, entry: Omit<StoolEntry, 'id'>) => void;
  addMedication: (
    date: string,
    entry: Omit<MedicationDose, 'id'>
  ) => {
    warnings: string[];
  };
  removeHydration: (date: string, id: string) => void;
  removeStool: (date: string, id: string) => void;
  removeMedication: (date: string, id: string) => void;
  updateNotes: (date: string, notes: string) => void;
  pegCaps: number;
  setPegCaps: (value: number) => void;
  titrationFor: (date: string) => PegTitration;
  profile: PlanProfile;
  setWeightKg: (value: number) => void;
  setHydrationGoalOz: (value: number) => void;
  setRegionFlag: (flag: string, enabled: boolean) => void;
  truth: typeof truthSource;
  syncWithCloud: () => Promise<void>;
  cloudState: CloudSyncState;
  lastSyncedAt?: string;
};

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

const shouldKeepLog = (log: DailyLog) =>
  log.hydration.length > 0 ||
  log.stool.length > 0 ||
  log.medications.length > 0 ||
  log.notes.trim().length > 0;

export const PlanProvider = ({ children }: { children: ReactNode }) => {
  const [storage, setStorage] = useLocalStorage<PlanStorage>(STORAGE_KEY, defaultStorage);
  const [cloudState, setCloudState] = useState<CloudSyncState>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(undefined);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profile = useMemo(() => mergeProfile(storage.profile), [storage.profile]);

  const setLogs = useCallback(
    (updater: (logs: DailyLog[]) => DailyLog[]) => {
      setStorage((prev) => {
        const normalizedProfile = mergeProfile(prev.profile);
        const nextLogs = updater(prev.logs);
        if (nextLogs === prev.logs && prev.profile === normalizedProfile) {
          return prev;
        }
        return { ...prev, logs: nextLogs, profile: normalizedProfile };
      });
    },
    [setStorage]
  );

  const getLogByDate = useCallback(
    (date: string) => {
      let snapshot: DailyLog | undefined;
      setStorage((prev) => {
        const normalizedProfile = mergeProfile(prev.profile);
        const { logs: updatedLogs, log } = ensureLogExists(prev.logs, date);
        snapshot = log;
        if (updatedLogs === prev.logs && prev.profile === normalizedProfile) {
          return prev;
        }
        return {
          ...prev,
          logs: updatedLogs,
          profile: normalizedProfile
        };
      });
      return snapshot ?? createEmptyLog(date);
    },
    [setStorage]
  );

  const addHydration = useCallback<PlanContextValue['addHydration']>(
    (date, entry) => {
      setLogs((prevLogs) => {
        const { logs: updatedLogs, log } = ensureLogExists(prevLogs, date);
        const newEntry: HydrationEntry = { id: generateId(), ...entry };
        const nextLog: DailyLog = { ...log, hydration: [...log.hydration, newEntry] };
        return updatedLogs.map((item) => (item.date === date ? nextLog : item));
      });
      return { warnings: [] };
    },
    [setLogs]
  );

  const addStool = useCallback<PlanContextValue['addStool']>(
    (date, entry) => {
      setLogs((prevLogs) => {
        const { logs: updatedLogs, log } = ensureLogExists(prevLogs, date);
        const newEntry: StoolEntry = { id: generateId(), ...entry };
        const nextLog: DailyLog = { ...log, stool: [...log.stool, newEntry] };
        return updatedLogs.map((item) => (item.date === date ? nextLog : item));
      });
    },
    [setLogs]
  );

  const addMedication = useCallback<PlanContextValue['addMedication']>(
    (date, entry) => {
      let warnings: string[] = [];
      setLogs((prevLogs) => {
        const { logs: updatedLogs, log } = ensureLogExists(prevLogs, date);
        warnings = evaluateSpacingWarnings(
          updatedLogs,
          date,
          entry.name,
          entry.time,
          truthSource.spacing_rules
        );
        const newEntry: MedicationDose = { id: generateId(), ...entry };
        const nextLog: DailyLog = { ...log, medications: [...log.medications, newEntry] };
        return updatedLogs.map((item) => (item.date === date ? nextLog : item));
      });
      return { warnings };
    },
    [setLogs]
  );

  const removeHydration = useCallback<PlanContextValue['removeHydration']>(
    (date, id) => {
      setLogs((prevLogs) => {
        let changed = false;
        const nextLogs = prevLogs.map((item) => {
          if (item.date !== date) {
            return item;
          }
          const nextHydration = item.hydration.filter((entry) => entry.id !== id);
          if (nextHydration.length === item.hydration.length) {
            return item;
          }
          changed = true;
          return { ...item, hydration: nextHydration };
        });
        if (!changed) {
          return prevLogs;
        }
        return nextLogs.filter(shouldKeepLog);
      });
    },
    [setLogs]
  );

  const removeStool = useCallback<PlanContextValue['removeStool']>(
    (date, id) => {
      setLogs((prevLogs) => {
        let changed = false;
        const nextLogs = prevLogs.map((item) => {
          if (item.date !== date) {
            return item;
          }
          const nextStool = item.stool.filter((entry) => entry.id !== id);
          if (nextStool.length === item.stool.length) {
            return item;
          }
          changed = true;
          return { ...item, stool: nextStool };
        });
        if (!changed) {
          return prevLogs;
        }
        return nextLogs.filter(shouldKeepLog);
      });
    },
    [setLogs]
  );

  const removeMedication = useCallback<PlanContextValue['removeMedication']>(
    (date, id) => {
      setLogs((prevLogs) => {
        let changed = false;
        const nextLogs = prevLogs.map((item) => {
          if (item.date !== date) {
            return item;
          }
          const nextMedications = item.medications.filter((entry) => entry.id !== id);
          if (nextMedications.length === item.medications.length) {
            return item;
          }
          changed = true;
          return { ...item, medications: nextMedications };
        });
        if (!changed) {
          return prevLogs;
        }
        return nextLogs.filter(shouldKeepLog);
      });
    },
    [setLogs]
  );

  const updateNotes = useCallback<PlanContextValue['updateNotes']>(
    (date, notes) => {
      setLogs((prevLogs) => {
        const { logs: updatedLogs, log } = ensureLogExists(prevLogs, date);
        const existed = updatedLogs === prevLogs;
        if (log.notes === notes) {
          return existed ? prevLogs : updatedLogs.filter(shouldKeepLog);
        }
        const nextLog: DailyLog = { ...log, notes };
        const mapped = updatedLogs.map((item) => (item.date === date ? nextLog : item));
        if (shouldKeepLog(nextLog)) {
          return mapped;
        }
        return mapped.filter(shouldKeepLog);
      });
    },
    [setLogs]
  );

  const titrationFor = useCallback<PlanContextValue['titrationFor']>(
    (date) => {
      const log = storage.logs.find((item) => item.date === date) ?? createEmptyLog(date);
      return computeTitration(log, storage.pegCaps, truthSource.titration.peg_3350);
    },
    [storage.logs, storage.pegCaps]
  );

  const setPegCaps = useCallback(
    (value: number) => {
      const { min_caps, max_caps } = truthSource.titration.peg_3350;
      if (!Number.isFinite(value)) {
        return;
      }
      const clamped = Math.min(Math.max(value, min_caps), max_caps);
      setStorage((prev) => {
        const normalizedProfile = mergeProfile(prev.profile);
        if (prev.pegCaps === clamped && prev.profile === normalizedProfile) {
          return prev;
        }
        return { ...prev, pegCaps: clamped, profile: normalizedProfile };
      });
    },
    [setStorage]
  );

  const setWeightKg = useCallback<PlanContextValue['setWeightKg']>(
    (value) => {
      if (!Number.isFinite(value)) {
        return;
      }
      const clampedWeight = clamp(value, 30, 150);
      setStorage((prev) => {
        const normalizedProfile = mergeProfile(prev.profile);
        if (normalizedProfile.weightKg === clampedWeight) {
          if (prev.profile === normalizedProfile) {
            return prev;
          }
          return { ...prev, profile: normalizedProfile };
        }
        return {
          ...prev,
          profile: { ...normalizedProfile, weightKg: clampedWeight }
        };
      });
    },
    [setStorage]
  );

  const setHydrationGoalOz = useCallback<PlanContextValue['setHydrationGoalOz']>(
    (value) => {
      if (!Number.isFinite(value)) {
        return;
      }
      const { min, max } = truthSource.targets.hydration_oz_day;
      const clampedGoal = clamp(value, min, max);
      setStorage((prev) => {
        const normalizedProfile = mergeProfile(prev.profile);
        if (normalizedProfile.hydrationGoalOz === clampedGoal) {
          if (prev.profile === normalizedProfile) {
            return prev;
          }
          return { ...prev, profile: normalizedProfile };
        }
        return {
          ...prev,
          profile: { ...normalizedProfile, hydrationGoalOz: clampedGoal }
        };
      });
    },
    [setStorage]
  );

  const setRegionFlag = useCallback<PlanContextValue['setRegionFlag']>(
    (flag, enabled) => {
      setStorage((prev) => {
        const normalizedProfile = mergeProfile(prev.profile);
        if (!(flag in normalizedProfile.regionFlags)) {
          if (prev.profile === normalizedProfile) {
            return prev;
          }
          return { ...prev, profile: normalizedProfile };
        }
        if (normalizedProfile.regionFlags[flag] === enabled) {
          if (prev.profile === normalizedProfile) {
            return prev;
          }
          return { ...prev, profile: normalizedProfile };
        }
        return {
          ...prev,
          profile: {
            ...normalizedProfile,
            regionFlags: {
              ...normalizedProfile.regionFlags,
              [flag]: enabled
            }
          }
        };
      });
    },
    [setStorage]
  );

  const syncWithCloud = useCallback(async () => {
    setCloudState('syncing');
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCloudState('success');
      setLastSyncedAt(new Date().toISOString());
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => setCloudState('idle'), 1200);
    } catch (error) {
      console.error('Cloud sync failed', error);
      setCloudState('error');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({
      logs: storage.logs,
      getLogByDate,
      addHydration,
      addStool,
      addMedication,
      removeHydration,
      removeStool,
      removeMedication,
      updateNotes,
      pegCaps: storage.pegCaps,
      setPegCaps,
      titrationFor,
      profile,
      setWeightKg,
      setHydrationGoalOz,
      setRegionFlag,
      truth: truthSource,
      syncWithCloud,
      cloudState,
      lastSyncedAt
    }),
    [
      storage.logs,
      getLogByDate,
      addHydration,
      addStool,
      addMedication,
      removeHydration,
      removeStool,
      removeMedication,
      updateNotes,
      storage.pegCaps,
      setPegCaps,
      titrationFor,
      profile,
      setWeightKg,
      setHydrationGoalOz,
      setRegionFlag,
      syncWithCloud,
      cloudState,
      lastSyncedAt
    ]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
