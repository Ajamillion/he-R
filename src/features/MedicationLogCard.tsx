import { FormEvent, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';
import { toTimeInputValue } from '../utils/date';

const supplementalOptions = ['PHGG', 'PEG 3350', 'Zinc', 'Pedialyte', 'Thiamine', 'Omega-3'];

type MedicationLogCardProps = {
  date: string;
};

export const MedicationLogCard = ({ date }: MedicationLogCardProps) => {
  const { logs, addMedication, removeMedication, truth } = usePlan();
  const log = useMemo(() => logs.find((item) => item.date === date), [logs, date]);
  const [time, setTime] = useState(() => toTimeInputValue());
  const [name, setName] = useState(truth.med_library[0]?.name ?? '');
  const [amount, setAmount] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const allOptions = [...new Set([...truth.med_library.map((med) => med.name), ...supplementalOptions])];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    const result = addMedication(date, { time, name: name.trim(), amount: amount.trim() });
    setWarnings(result.warnings);
    setTime(toTimeInputValue());
    setAmount('');
  };

  const handleRemove = (id: string) => {
    removeMedication(date, id);
    setWarnings([]);
  };

  return (
    <Card title="Medication & supplement log" tag={`Entries ${log?.medications.length ?? 0}`} className="span-4">
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="med-time">Time</label>
          <input
            id="med-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="med-name">Name</label>
          <input
            id="med-name"
            list="medication-options"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <datalist id="medication-options">
            {allOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="med-amount">Amount / notes</label>
          <input
            id="med-amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="e.g. 550 mg"
          />
        </div>
        <button className="button" type="submit">
          Log dose
        </button>
      </form>
      {warnings.length > 0 ? (
        <div className="alert">
          <strong>Spacing caution:</strong>
          <ul className="list">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {log && log.medications.length > 0 ? (
        <table className="log-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Name</th>
              <th>Amount</th>
              <th className="log-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {log.medications.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.time}</td>
                <td>{entry.name}</td>
                <td>{entry.amount || '—'}</td>
                <td className="log-table__actions">
                  <button
                    type="button"
                    className="button button--text button--text-danger"
                    onClick={() => handleRemove(entry.id)}
                    aria-label={`Remove ${entry.name} logged at ${entry.time}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ margin: 0, color: 'rgba(29, 53, 87, 0.7)' }}>No doses logged.</p>
      )}
    </Card>
  );
};
