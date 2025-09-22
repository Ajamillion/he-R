import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

export const MicrocopyCard = () => {
  const { truth } = usePlan();
  return (
    <Card title="Microcopy" tag="Nudges" className="span-4">
      <div className="microcopy">
        {truth.microcopy_library.map((line) => (
          <p key={line} className="microcopy__item">
            {line}
          </p>
        ))}
      </div>
    </Card>
  );
};
