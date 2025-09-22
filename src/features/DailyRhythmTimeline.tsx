import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

export const DailyRhythmTimeline = () => {
  const { truth } = usePlan();
  return (
    <Card title="Daily Rhythm" tag="Structure" className="span-6">
      <div className="timeline">
        {truth.daily_rhythm.map((entry) => (
          <div className="timeline__item" key={entry.time}>
            <span className="timeline__time">{entry.time}</span>
            <ul className="list">
              {entry.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
};
