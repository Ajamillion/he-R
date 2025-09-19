import { FormEvent, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';
import { toTimeInputValue } from '../utils/date';

const ouncesOptions = [4, 6, 8, 10, 12, 16];

type HydrationLogCardProps = {
  date: string;
};

export const HydrationLogCard = ({ date }: HydrationLogCardProps) => {
  const { logs, addHydration, truth, profile } = usePlan();
  const log = useMemo(() => logs.find((item) => item.date === date), [logs, date]);
  const [time, setTime] = useState(() => toTimeInputValue());
  const [ounces, setOunces] = useState(8);

  const total = log?.hydration.reduce((sum, entry) => sum + entry.ounces, 0) ?? 0;
  const hydrationTarget = truth.targets.hydration_oz_day;
  const planGoal = profile.hydrationGoalOz;
  const progress = Math.min(100, Math.round((total / planGoal) * 100));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!time) return;
    addHydration(date, { time, ounces });
    setTime(toTimeInputValue());
  };

  return (
    <Card
      title="Hydration log"
      tag={`Daily total ${total} oz (${progress}% of ${planGoal} oz)`}
      className="span-4"
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="hydration-time">Time</label>
          <input
            id="hydration-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="hydration-ounces">Ounces</label>
          <select
            id="hydration-ounces"
            value={ounces}
            onChange={(event) => setOunces(Number(event.target.value))}
          >
            {ouncesOptions.map((option) => (
              <option key={option} value={option}>
                {option} oz
              </option>
            ))}
          </select>
        </div>
        <button className="button" type="submit">
          Log hydration
        </button>
      </form>
      {log && log.hydration.length > 0 ? (
        <table className="log-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {log.hydration.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.time}</td>
                <td>{entry.ounces} oz</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ margin: 0, color: 'rgba(29, 53, 87, 0.7)' }}>No hydration logged yet.</p>
      )}
    </Card>
  );
};
