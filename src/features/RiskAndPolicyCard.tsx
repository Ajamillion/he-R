import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

export const RiskAndPolicyCard = () => {
  const { truth } = usePlan();
  return (
    <Card title="Risk & Policy" tag="Stay ahead" className="span-8">
      <section>
        <h3 className="section-heading">Precipitating factors</h3>
        <div className="tag-list">
          {truth.precipitating_factors.map((factor) => (
            <span key={factor} className="tag">
              {factor}
            </span>
          ))}
        </div>
      </section>
      <section>
        <h3 className="section-heading">Avoid list</h3>
        <div className="tag-list">
          {truth.avoid_set.map((item) => (
            <span key={item} className="tag">
              {item}
            </span>
          ))}
        </div>
      </section>
      <section>
        <h3 className="section-heading">Electrolyte policy</h3>
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-card__label">Monitor</span>
            <span>{truth.electrolyte_policy.monitor.join(', ')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Actions</span>
            <span>{truth.electrolyte_policy.actions.join(', ')}</span>
          </div>
        </div>
      </section>
      <section>
        <h3 className="section-heading">Labs & Regions</h3>
        <div className="tag-list">
          <span className="tag">Labs every {truth.lab_cadence.weeks} weeks</span>
          {truth.region_flags.map((flag) => (
            <span key={flag} className="tag">
              Region flag: {flag}
            </span>
          ))}
        </div>
      </section>
    </Card>
  );
};
