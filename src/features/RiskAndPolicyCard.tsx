import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';
import { formatDateTimeFriendly } from '../utils/date';

export const RiskAndPolicyCard = () => {
  const { truth, factors, setFactorActive, setFactorNote } = usePlan();
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const orderedFactors = useMemo(
    () =>
      truth.precipitating_factors.map((name) => ({
        name,
        state: factors[name] ?? { active: false, note: '' }
      })),
    [truth.precipitating_factors, factors]
  );

  useEffect(() => {
    const next: Record<string, string> = {};
    orderedFactors.forEach(({ name, state }) => {
      next[name] = state.note ?? '';
    });
    setNotesDraft(next);
  }, [orderedFactors]);

  const activeCount = orderedFactors.filter(({ state }) => state.active).length;
  const noteCount = orderedFactors.filter(({ state }) => state.note && state.note.length > 0).length;

  return (
    <Card title="Risk & Policy" tag="Stay ahead" className="span-8">
      <section>
        <h3 className="section-heading">Precipitating factors</h3>
        <p className="helper-text">
          Mark any triggers present today and capture quick notes to coordinate with your care team.
        </p>
        <div className="factor-summary">
          <span className="badge">Active {activeCount} / {orderedFactors.length}</span>
          <span className="badge">Notes {noteCount}</span>
        </div>
        <div className="factor-grid">
          {orderedFactors.map(({ name, state }) => (
            <article key={name} className={`factor-card ${state.active ? 'factor-card--active' : ''}`}>
              <label className="checkbox factor-card__checkbox">
                <input
                  type="checkbox"
                  checked={state.active}
                  onChange={(event) => setFactorActive(name, event.target.checked)}
                />
                <span>{name}</span>
              </label>
              <textarea
                className="factor-card__notes"
                value={notesDraft[name] ?? ''}
                onChange={(event) => setNotesDraft((prev) => ({ ...prev, [name]: event.target.value }))}
                onBlur={(event) => {
                  const value = event.target.value;
                  setNotesDraft((prev) => ({ ...prev, [name]: value }));
                  setFactorNote(name, value);
                }}
                placeholder="Add context or follow-up"
                rows={2}
                disabled={!state.active}
              />
              <div className="factor-card__meta">
                {state.updatedAt ? (
                  <span className="helper-text">Updated {formatDateTimeFriendly(state.updatedAt)}</span>
                ) : (
                  <span className="helper-text">No updates yet</span>
                )}
              </div>
            </article>
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
