import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

export const SpacingRulesCard = () => {
  const { truth } = usePlan();
  return (
    <Card title="Spacing Rules" tag="Timing" className="span-4">
      <ul className="list list--bordered">
        {truth.spacing_rules.map((rule) => (
          <li key={`${rule.a}-${rule.b}`}>
            Keep <strong>{rule.a}</strong> and <strong>{rule.b}</strong> at least {rule.min_minutes} minutes apart.
          </li>
        ))}
      </ul>
    </Card>
  );
};
