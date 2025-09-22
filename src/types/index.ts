export type HydrationEntry = {
  id: string;
  ounces: number;
  time: string;
};

export type StoolEntry = {
  id: string;
  time: string;
  bristol: number;
};

export type MedicationDose = {
  id: string;
  time: string;
  name: string;
  amount: string;
};

export type RhythmChecklistEntry = {
  id: string;
  time: string;
  task: string;
  completedAt: string;
};

export type RhythmChecklistItem = Omit<RhythmChecklistEntry, 'completedAt'>;

export type DailyLog = {
  date: string; // YYYY-MM-DD
  hydration: HydrationEntry[];
  stool: StoolEntry[];
  medications: MedicationDose[];
  rhythmChecklist: RhythmChecklistEntry[];
  notes: string;
};

export type PegTitration = {
  currentCaps: number;
  recommendation: 'increase' | 'decrease' | 'hold';
  suggestedDelta: number;
};

export type CloudSyncState = 'idle' | 'syncing' | 'error' | 'success';

export type PlanProfile = {
  weightKg: number;
  hydrationGoalOz: number;
  regionFlags: Record<string, boolean>;
  lastLabDate?: string;
};

export type PrecipitatingFactorState = {
  active: boolean;
  note: string;
  updatedAt?: string;
};

export type PrecipitatingFactorMap = Record<string, PrecipitatingFactorState>;
