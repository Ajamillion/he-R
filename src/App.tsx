import { useEffect, useMemo, useState } from 'react';
import { CloudSyncBanner } from './features/CloudSyncBanner';
import { DailyRhythmTimeline } from './features/DailyRhythmTimeline';
import { HydrationLogCard } from './features/HydrationLogCard';
import { LogDateSelector } from './features/LogDateSelector';
import { MedicationLibraryCard } from './features/MedicationLibraryCard';
import { MedicationLogCard } from './features/MedicationLogCard';
import { MicrocopyCard } from './features/MicrocopyCard';
import { NotesCard } from './features/NotesCard';
import { PegTitrationCard } from './features/PegTitrationCard';
import { RiskAndPolicyCard } from './features/RiskAndPolicyCard';
import { LabRemindersCard } from './features/LabRemindersCard';
import { SleepHygieneCard } from './features/SleepHygieneCard';
import { SpacingRulesCard } from './features/SpacingRulesCard';
import { StagingMapCard } from './features/StagingMapCard';
import { StoolLogCard } from './features/StoolLogCard';
import { StoolQualityCard } from './features/StoolQualityCard';
import { TargetsOverview } from './features/TargetsOverview';
import { PlanSettingsCard } from './features/PlanSettingsCard';
import { PlanInsightsCard } from './features/PlanInsightsCard';
import { PlanExportCard } from './features/PlanExportCard';
import { usePlan } from './state/PlanContext';
import { formatDateFriendly, todayInputValue } from './utils/date';

const tagline = 'Daily support to keep hepatic encephalopathy plans on track.';

function App() {
  const [selectedDate, setSelectedDate] = useState(todayInputValue());
  const { getLogByDate, logs } = usePlan();

  useEffect(() => {
    getLogByDate(selectedDate);
  }, [getLogByDate, selectedDate]);

  const log = useMemo(() => logs.find((entry) => entry.date === selectedDate), [logs, selectedDate]);
  const hydrationCount = log?.hydration.length ?? 0;
  const stoolCount = log?.stool.length ?? 0;
  const medicationCount = log?.medications.length ?? 0;

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div>
          <h1 className="app-shell__title">HE•R Companion</h1>
          <p className="app-shell__subtitle">{tagline}</p>
        </div>
        <CloudSyncBanner />
        <div className="form-grid">
          <LogDateSelector value={selectedDate} onChange={setSelectedDate} />
          <div className="stat-card">
            <span className="stat-card__label">Summary</span>
            <span>{formatDateFriendly(selectedDate)}</span>
            <span className="badge">
              Hydration {hydrationCount} · Stool {stoolCount} · Doses {medicationCount}
            </span>
          </div>
        </div>
      </header>
      <main className="grid grid--dashboard">
        <PlanSettingsCard />
        <TargetsOverview />
        <PlanInsightsCard date={selectedDate} />
        <DailyRhythmTimeline />
        <PegTitrationCard date={selectedDate} />
        <HydrationLogCard date={selectedDate} />
        <StoolLogCard date={selectedDate} />
        <MedicationLogCard date={selectedDate} />
        <SpacingRulesCard />
        <StoolQualityCard />
        <NotesCard date={selectedDate} />
        <MedicationLibraryCard />
        <RiskAndPolicyCard />
        <LabRemindersCard />
        <StagingMapCard />
        <SleepHygieneCard />
        <MicrocopyCard />
        <PlanExportCard date={selectedDate} />
      </main>
    </div>
  );
}

export default App;
