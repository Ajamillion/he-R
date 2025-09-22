import { useMemo } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';
import { summarizeLogsForDates } from '../state/planLogic';
import { formatDateFriendly, getLookbackRange } from '../utils/date';

const LOOKBACK_DAYS = 7;

type PlanInsightsCardProps = {
  date: string;
};

const formatAverage = (hasData: boolean, value: number, suffix: string) =>
  hasData ? `${value.toFixed(1)}${suffix}` : '—';

export const PlanInsightsCard = ({ date }: PlanInsightsCardProps) => {
  const { logs, profile } = usePlan();

  const range = useMemo(() => getLookbackRange(date, LOOKBACK_DAYS), [date]);
  const summary = useMemo(() => summarizeLogsForDates(logs, range), [logs, range]);

  const hasData = summary.days > 0;
  const hydrationAverage = hasData ? summary.hydrationAverageOz : 0;
  const stoolAverage = hasData ? summary.stoolAverageCount : 0;
  const medicationDays = hasData ? Math.round(summary.medicationAdherenceRatio * summary.days) : 0;
  const medicationPercent = hasData ? Math.round(summary.medicationAdherenceRatio * 100) : 0;
  const hydrationDelta = hasData ? hydrationAverage - profile.hydrationGoalOz : 0;

  const startLabel = range.length > 0 ? formatDateFriendly(range[0]) : formatDateFriendly(date);
  const endLabel = range.length > 0 ? formatDateFriendly(range[range.length - 1]) : formatDateFriendly(date);

  let insightMessage = 'Log hydration, stool, or medications to unlock 7-day insights.';
  if (hasData) {
    if (hydrationAverage < profile.hydrationGoalOz * 0.8) {
      const gap = Math.max(0, profile.hydrationGoalOz - hydrationAverage);
      insightMessage = `Hydration average is ${gap.toFixed(1)} oz below goal—add sips through the day to close the gap.`;
    } else if (stoolAverage < 1.5) {
      insightMessage = `Stool entries average ${stoolAverage.toFixed(1)} per day. Keep titrating toward 2–3 logs.`;
    } else if (medicationPercent < 60) {
      insightMessage = `Medication doses were captured on ${medicationDays} of ${summary.days} days. Set gentle reminders to stay on track.`;
    } else {
      insightMessage = 'Rhythm looks steady—keep following the plan and celebrate the consistency.';
    }
  }

  const lastStoolDay = [...summary.range].reverse().find((day) => day.stoolCount > 0);
  const lastMedicationDay = [...summary.range].reverse().find((day) => day.medicationCount > 0);
  const topHydrationDay = summary.topHydrationDay;

  return (
    <Card title="Plan insights" tag={`Last ${LOOKBACK_DAYS} days`} className="span-6">
      <p className="helper-text">Range {startLabel} – {endLabel}</p>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Hydration average</span>
          <span className="stat-card__value">{formatAverage(hasData, hydrationAverage, ' oz')}</span>
          <span className="badge">
            {hasData ? `${hydrationDelta >= 0 ? '+' : ''}${hydrationDelta.toFixed(1)} vs goal` : 'Log entries to compare'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Stool cadence</span>
          <span className="stat-card__value">{formatAverage(hasData, stoolAverage, '')}</span>
          <span className="badge">Goal 2–3 per day</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Medication days</span>
          <span className="stat-card__value">
            {hasData ? `${medicationDays} / ${summary.days}` : '—'}
          </span>
          <span className="badge">{hasData ? `${medicationPercent}% recorded` : 'Log doses to track'}</span>
        </div>
      </div>
      <p className="helper-text">{insightMessage}</p>
      <ul className="list list--compact">
        <li>
          <strong>Best hydration day:</strong>{' '}
          {topHydrationDay
            ? `${formatDateFriendly(topHydrationDay.date)} • ${topHydrationDay.hydrationOz.toFixed(1)} oz`
            : 'No hydration logged'}
        </li>
        <li>
          <strong>Last stool log:</strong>{' '}
          {lastStoolDay ? formatDateFriendly(lastStoolDay.date) : 'None in range'}
        </li>
        <li>
          <strong>Last medication log:</strong>{' '}
          {lastMedicationDay ? formatDateFriendly(lastMedicationDay.date) : 'None in range'}
        </li>
      </ul>
    </Card>
  );
};
