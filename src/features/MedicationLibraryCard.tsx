import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

export const MedicationLibraryCard = () => {
  const { truth, profile } = usePlan();
  return (
    <Card title="Medication Library" tag="Clinician-guided" className="span-8">
      <div className="list">
        {truth.med_library.map((med) => (
          <article key={med.name} className="stat-card">
            <header>
              <h3 style={{ margin: 0 }}>{med.name}</h3>
              <div className="tag-list">
                {med.first_line ? <span className="tag">First-line</span> : null}
                {med.maintenance ? <span className="tag">Maintenance</span> : null}
                {med.adjunct ? <span className="tag">Adjunct</span> : null}
                {med.clinician_only ? <span className="tag">Clinician only</span> : null}
                {'availability_flag' in med && med.availability_flag ? (
                  <span
                    className={`tag ${profile.regionFlags[med.availability_flag] ? 'tag--positive' : 'tag--warning'}`}
                  >
                    {profile.regionFlags[med.availability_flag] ? 'Available regionally' : 'Check availability'}
                  </span>
                ) : null}
              </div>
            </header>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Route:</strong> {med.route.join(', ')}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Sig:</strong> {med.sig_template}
            </p>
            {'formulation' in med && med.formulation ? (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Formulation:</strong> {med.formulation.strength_per_15ml_g} g / 15 mL ·{' '}
                {med.formulation.mg_per_ml} mg per mL
              </p>
            ) : null}
            {'availability_flag' in med && med.availability_flag ? (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Availability flag:</strong> {med.availability_flag} –{' '}
                {profile.regionFlags[med.availability_flag] ? 'enabled in plan' : 'currently disabled'}
              </p>
            ) : null}
            {'course_flag' in med && med.course_flag ? (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Course flag:</strong> {med.course_flag}
              </p>
            ) : null}
            {'safety' in med && med.safety ? (
              <ul className="list" style={{ marginTop: '0.5rem' }}>
                <li>
                  <strong>Renal block:</strong> creatinine ≥ {med.safety.renal_block_creatinine_mg_dl} mg/dL
                </li>
                {med.safety.pregnancy_lactation_hidden ? (
                  <li>Pregnancy &amp; lactation safety details hidden</li>
                ) : null}
              </ul>
            ) : null}
            {'access_fields' in med && med.access_fields ? (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Access checklist:</strong> {med.access_fields.join(', ')}
              </p>
            ) : null}
            {'adherence_fields' in med && med.adherence_fields ? (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Adherence log:</strong> {med.adherence_fields.join(', ')}
              </p>
            ) : null}
            {'logging' in med && med.logging ? (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Logging:</strong> {med.logging.join(', ')}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </Card>
  );
};
