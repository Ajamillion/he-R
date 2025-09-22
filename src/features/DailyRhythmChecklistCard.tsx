import { useMemo } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';
import { formatDateTimeFriendly } from '../utils/date';
import { buildRhythmReference, makeRhythmItemId } from '../utils/rhythm';

type DailyRhythmChecklistCardProps = {
  date: string;
};

export const DailyRhythmChecklistCard = ({ date }: DailyRhythmChecklistCardProps) => {
  const { truth, logs, setRhythmCompletion } = usePlan();

  const reference = useMemo(() => buildRhythmReference(truth.daily_rhythm), [truth.daily_rhythm]);

  const log = useMemo(() => logs.find((entry) => entry.date === date), [logs, date]);

  const completionMap = useMemo(() => {
    if (!log) {
      return new Map<string, { completedAt: string }>();
    }
    return new Map(log.rhythmChecklist.map((entry) => [entry.id, { completedAt: entry.completedAt }]));
  }, [log]);

  const completedCount = log?.rhythmChecklist.length ?? 0;
  const totalCount = reference.length;

  return (
    <Card
      title="Daily rhythm checklist"
      tag={`${completedCount} / ${totalCount} done`}
      className="span-6"
    >
      <p className="helper-text">Tap to acknowledge each habit as you move through the day.</p>
      <div className="checklist-grid">
        {truth.daily_rhythm.map((entry) => (
          <section key={entry.time} className="checklist-group">
            <header className="checklist-group__header">
              <span className="checklist-group__time">{entry.time}</span>
              <span className="checklist-group__count">
                {entry.items.length} item{entry.items.length === 1 ? '' : 's'}
              </span>
            </header>
            <ul className="checklist-group__list">
              {entry.items.map((task) => {
                const id = makeRhythmItemId(entry.time, task);
                const completion = completionMap.get(id);
                const checked = Boolean(completion);
                return (
                  <li key={id} className={`checklist-item ${checked ? 'checklist-item--checked' : ''}`}>
                    <label className="checkbox checklist-item__checkbox">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setRhythmCompletion(date, { id, time: entry.time, task }, event.target.checked)
                        }
                      />
                      <span>{task}</span>
                    </label>
                    <span className="checklist-item__meta">
                      {completion
                        ? `Completed ${formatDateTimeFriendly(completion.completedAt)}`
                        : 'Not yet'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Card>
  );
};
