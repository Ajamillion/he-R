import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';
import {
  differenceInDays,
  formatDateFriendly,
  isValidDateInput,
  shiftDate,
  todayInputValue
} from '../utils/date';

const pluralize = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'}`;

type LabStatusTone = 'neutral' | 'positive' | 'warning' | 'danger';

type LabStatus = {
  label: string;
  tone: LabStatusTone;
};

export const LabRemindersCard = () => {
  const { truth, profile, setLastLabDate } = usePlan();
  const [draft, setDraft] = useState(profile.lastLabDate ?? '');
  const cadenceWeeks = truth.lab_cadence.weeks;
  const today = todayInputValue();

  useEffect(() => {
    setDraft(profile.lastLabDate ?? '');
  }, [profile.lastLabDate]);

  const nextLabDate = useMemo(() => {
    if (!profile.lastLabDate || !isValidDateInput(profile.lastLabDate)) {
      return undefined;
    }
    return shiftDate(profile.lastLabDate, cadenceWeeks * 7);
  }, [profile.lastLabDate, cadenceWeeks]);

  const labStatus = useMemo<LabStatus>(() => {
    if (!nextLabDate) {
      return {
        label: 'Log the last comprehensive panel to start tracking cadence.',
        tone: 'neutral'
      };
    }
    const delta = differenceInDays(today, nextLabDate);
    if (delta > 7) {
      return { label: `Due in ${pluralize(delta, 'day')}`, tone: 'positive' };
    }
    if (delta > 0) {
      return { label: `Due in ${pluralize(delta, 'day')}`, tone: 'warning' };
    }
    if (delta === 0) {
      return { label: 'Due today', tone: 'warning' };
    }
    const overdue = Math.abs(delta);
    return { label: `Overdue by ${pluralize(overdue, 'day')}`, tone: 'danger' };
  }, [nextLabDate, today]);

  const commitDraft = () => {
    if (!draft) {
      setLastLabDate(undefined);
      return;
    }
    if (isValidDateInput(draft)) {
      setLastLabDate(draft);
    } else {
      setDraft(profile.lastLabDate ?? '');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    commitDraft();
  };

  const badgeClass = `badge badge--${labStatus.tone}`;
  const cadenceLabel = `Cadence ${pluralize(cadenceWeeks, 'week')}`;

  return (
    <Card title="Labs & monitoring" tag={cadenceLabel} className="span-4">
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="lab-date">Last lab draw</label>
          <input
            id="lab-date"
            type="date"
            value={draft}
            max={today}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
          />
          <small className="helper-text">Track CMP/ammonia panels to stay ahead of trends.</small>
        </div>
        <div className="button-row">
          <button
            className="button"
            type="button"
            onClick={() => {
              setDraft(today);
              setLastLabDate(today);
            }}
          >
            Mark today
          </button>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => {
              setDraft('');
              setLastLabDate(undefined);
            }}
          >
            Clear
          </button>
        </div>
      </form>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Last recorded</span>
          <span className="stat-card__value">
            {profile.lastLabDate ? formatDateFriendly(profile.lastLabDate) : 'Not recorded'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Next due</span>
          <span className="stat-card__value">
            {nextLabDate ? formatDateFriendly(nextLabDate) : 'Set last labs'}
          </span>
          <span className={badgeClass}>{labStatus.label}</span>
        </div>
      </div>
      <section>
        <h3 className="section-heading">Electrolyte policy</h3>
        <p className="helper-text">Monitor these values and act quickly when they drift.</p>
        <div className="tag-list">
          {truth.electrolyte_policy.monitor.map((item) => (
            <span key={item} className="tag">
              {item}
            </span>
          ))}
        </div>
        <ul className="list list--compact">
          {truth.electrolyte_policy.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>
    </Card>
  );
};
