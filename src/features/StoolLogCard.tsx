import { FormEvent, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';
import { toTimeInputValue } from '../utils/date';

const bristolScores = [1, 2, 3, 4, 5, 6, 7];

type StoolLogCardProps = {
  date: string;
};

export const StoolLogCard = ({ date }: StoolLogCardProps) => {
  const { logs, addStool, truth } = usePlan();
  const log = useMemo(() => logs.find((item) => item.date === date), [logs, date]);
  const [time, setTime] = useState(() => toTimeInputValue());
  const [score, setScore] = useState(4);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addStool(date, { time, bristol: score });
    setTime(toTimeInputValue());
  };

  return (
    <Card
      title="Stool log"
      tag={`Entries ${log?.stool.length ?? 0}`}
      className="span-4"
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="stool-time">Time</label>
          <input
            id="stool-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="stool-score">Bristol score</label>
          <select
            id="stool-score"
            value={score}
            onChange={(event) => setScore(Number(event.target.value))}
          >
            {bristolScores.map((value) => {
              const key = String(value) as keyof typeof truth.stool_quality.mapping;
              return (
                <option key={value} value={value}>
                  {value} · {truth.stool_quality.mapping[key]}
                </option>
              );
            })}
          </select>
        </div>
        <button className="button" type="submit">
          Log stool event
        </button>
      </form>
      {log && log.stool.length > 0 ? (
        <table className="log-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Score</th>
              <th>Guidance</th>
            </tr>
          </thead>
          <tbody>
            {log.stool.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.time}</td>
                <td>{entry.bristol}</td>
                <td>
                  {
                    truth.stool_quality.mapping[
                      String(entry.bristol) as keyof typeof truth.stool_quality.mapping
                    ]
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ margin: 0, color: 'rgba(29, 53, 87, 0.7)' }}>No stool log entries.</p>
      )}
    </Card>
  );
};
