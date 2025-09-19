import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

const formatFlagLabel = (flag: string) => flag.replace(/_/g, ' ');

export const PlanSettingsCard = () => {
  const { profile, setRegionFlag, truth } = usePlan();

  return (
    <Card title="Plan configuration" tag="Preferences" className="span-4">
      <fieldset className="fieldset">
        <legend>Regional medication availability</legend>
        <p className="helper-text">Toggle based on your locale to surface accessible adjuncts.</p>
        <div className="checkbox-grid">
          {truth.region_flags.map((flag) => (
            <label key={flag} className="checkbox">
              <input
                type="checkbox"
                checked={Boolean(profile.regionFlags[flag])}
                onChange={(event) => setRegionFlag(flag, event.target.checked)}
              />
              <span>{formatFlagLabel(flag)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="stat-card">
        <span className="stat-card__label">Driving caution states</span>
        <span>{truth.driving_caution_states.map((state) => state.toUpperCase()).join(', ')}</span>
      </div>
      <div className="stat-card">
        <span className="stat-card__label">Lab cadence</span>
        <span>Every {truth.lab_cadence.weeks} weeks</span>
      </div>
    </Card>
  );
};
