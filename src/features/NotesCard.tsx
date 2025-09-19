import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { usePlan } from '../state/PlanContext';

type NotesCardProps = {
  date: string;
};

export const NotesCard = ({ date }: NotesCardProps) => {
  const { logs, updateNotes } = usePlan();
  const log = useMemo(() => logs.find((item) => item.date === date), [logs, date]);
  const [value, setValue] = useState(log?.notes ?? '');

  useEffect(() => {
    setValue(log?.notes ?? '');
  }, [log?.notes]);

  return (
    <Card title="Daily notes" tag="Context" className="span-8">
      <div className="field">
        <label htmlFor="daily-notes" className="visually-hidden">
          Notes for {date}
        </label>
        <textarea
          id="daily-notes"
          placeholder="Add stool cues, meals, sleep, precipitating factors..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => updateNotes(date, value)}
        />
      </div>
    </Card>
  );
};
