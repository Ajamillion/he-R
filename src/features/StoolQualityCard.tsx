import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

export const StoolQualityCard = () => {
  const { truth } = usePlan();
  const goals = truth.stool_quality.bristol_goal.join('–');
  return (
    <Card title="Stool Quality" tag={`Goal Bristol ${goals}`} className="span-4">
      <ul className="list list--bordered">
        {Object.entries(truth.stool_quality.mapping).map(([score, guidance]) => (
          <li key={score}>
            <strong>{score}</strong>: {guidance}
          </li>
        ))}
      </ul>
    </Card>
  );
};
