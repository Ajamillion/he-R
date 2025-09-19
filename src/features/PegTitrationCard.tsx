import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

const formatCaps = (value: number) => `${value.toFixed(2)} caps`;

type PegTitrationCardProps = {
  date: string;
};

export const PegTitrationCard = ({ date }: PegTitrationCardProps) => {
  const { pegCaps, setPegCaps, titrationFor, truth } = usePlan();
  const titration = titrationFor(date);
  const [draft, setDraft] = useState(pegCaps);
  const suggestedCaps = useMemo(() => pegCaps + titration.suggestedDelta, [pegCaps, titration.suggestedDelta]);

  const { min_caps, max_caps, step_cap } = truth.titration.peg_3350;

  useEffect(() => {
    setDraft(pegCaps);
  }, [pegCaps]);

  return (
    <Card title="PEG 3350 titration" tag={`Step ${step_cap} cap`} className="span-4">
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Current</span>
          <span className="stat-card__value">{formatCaps(pegCaps)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Recommendation</span>
          <span className="stat-card__value">{titration.recommendation.toUpperCase()}</span>
          {titration.recommendation !== 'hold' ? (
            <span className="badge">{formatCaps(Math.max(min_caps, Math.min(max_caps, suggestedCaps)))}</span>
          ) : (
            <span className="badge">Stay steady</span>
          )}
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="peg-caps">Set PEG caps</label>
          <input
            id="peg-caps"
            type="number"
            step={step_cap}
            min={min_caps}
            max={max_caps}
            value={draft}
            onChange={(event) => setDraft(Number(event.target.value))}
            onBlur={() => setPegCaps(draft)}
          />
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'rgba(29,53,87,0.65)' }}>
            Clamp {min_caps} – {max_caps} caps
          </p>
        </div>
        {titration.recommendation !== 'hold' ? (
          <button className="button" type="button" onClick={() => setPegCaps(suggestedCaps)}>
            Apply suggestion
          </button>
        ) : null}
      </div>
    </Card>
  );
};
