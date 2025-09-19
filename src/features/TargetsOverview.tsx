import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

export const TargetsOverview = () => {
  const { truth, profile, setWeightKg, setHydrationGoalOz } = usePlan();
  const [weightDraft, setWeightDraft] = useState(profile.weightKg.toString());
  const [hydrationDraft, setHydrationDraft] = useState(profile.hydrationGoalOz.toString());

  useEffect(() => {
    setWeightDraft(profile.weightKg.toString());
  }, [profile.weightKg]);

  useEffect(() => {
    setHydrationDraft(profile.hydrationGoalOz.toString());
  }, [profile.hydrationGoalOz]);

  const proteinTargets = useMemo(() => {
    const { min, mid, max, round_to } = truth.targets.protein_g_per_kg_day;
    const round = (value: number) => Math.round(value / round_to) * round_to;
    return {
      min: round(profile.weightKg * min),
      mid: round(profile.weightKg * mid),
      max: round(profile.weightKg * max)
    };
  }, [profile.weightKg, truth.targets.protein_g_per_kg_day]);

  const hydration = truth.targets.hydration_oz_day;

  const commitWeight = () => {
    if (!weightDraft) {
      setWeightDraft(profile.weightKg.toString());
      return;
    }
    const next = Number(weightDraft);
    if (Number.isFinite(next)) {
      setWeightKg(next);
    } else {
      setWeightDraft(profile.weightKg.toString());
    }
  };

  const commitHydration = () => {
    if (!hydrationDraft) {
      setHydrationDraft(profile.hydrationGoalOz.toString());
      return;
    }
    const next = Number(hydrationDraft);
    if (Number.isFinite(next)) {
      setHydrationGoalOz(next);
    } else {
      setHydrationDraft(profile.hydrationGoalOz.toString());
    }
  };

  return (
    <Card title="Daily Targets" tag="Essentials" className="span-6">
      <div className="form-grid">
        <div className="field">
          <label htmlFor="weight-input">Body weight (kg)</label>
          <input
            id="weight-input"
            type="number"
            min={30}
            max={150}
            value={weightDraft}
            onChange={(event) => setWeightDraft(event.target.value)}
            onBlur={commitWeight}
          />
        </div>
        <div className="field">
          <label htmlFor="hydration-goal">Hydration goal (oz)</label>
          <input
            id="hydration-goal"
            type="number"
            min={hydration.min}
            max={hydration.max}
            value={hydrationDraft}
            onChange={(event) => setHydrationDraft(event.target.value)}
            onBlur={commitHydration}
          />
          <small className="helper-text">Range {hydration.min}–{hydration.max} oz</small>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Protein / day</span>
          <span className="stat-card__value">
            {proteinTargets.min} – {proteinTargets.max} g
          </span>
          <span className="badge">Aim for ~{proteinTargets.mid} g</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Hydration</span>
          <span className="stat-card__value">
            {hydration.min} – {hydration.max} oz
          </span>
          <span className="badge">Plan goal {profile.hydrationGoalOz} oz</span>
        </div>
      </div>
      <div className="stat-card">
        <span className="stat-card__label">Late snack (≈21:00)</span>
        <span>{truth.targets.late_snack}</span>
      </div>
      <ul className="list">
        {truth.targets.notes.map((note) => (
          <li key={note} className="microcopy__item">
            {note}
          </li>
        ))}
      </ul>
    </Card>
  );
};
