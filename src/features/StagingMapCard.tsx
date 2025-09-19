import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

const stageLabels: Record<string, string> = {
  mhe: 'Minimal HE',
  ohe_mild: 'Overt HE · Mild',
  ohe_mod: 'Overt HE · Moderate',
  ohe_severe: 'Overt HE · Severe',
  emergent: 'Emergent'
};

export const StagingMapCard = () => {
  const { truth } = usePlan();
  return (
    <Card title="Staging" tag="West Haven" className="span-4">
      <table className="log-table">
        <thead>
          <tr>
            <th>West Haven</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {truth.staging_map.map((stage) => (
            <tr key={stage.west_haven}>
              <td>{stage.west_haven}</td>
              <td>{stageLabels[stage.product_state] ?? stage.product_state}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="tag-list">
        {truth.driving_caution_states.map((state) => (
          <span className="tag" key={state}>
            Driving caution: {stageLabels[state] ?? state}
          </span>
        ))}
      </div>
    </Card>
  );
};
