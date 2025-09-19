import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

export const SleepHygieneCard = () => {
  const { truth } = usePlan();
  return (
    <Card title="Sleep Hygiene" tag="Rest" className="span-4">
      <ul className="list list--bordered">
        {truth.sleep_hygiene_tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </Card>
  );
};
