import type { ChangeEventHandler } from 'react';

type LogDateSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export const LogDateSelector = ({ value, onChange }: LogDateSelectorProps) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className="field">
      <label htmlFor="log-date">Log date</label>
      <input id="log-date" type="date" value={value} onChange={handleChange} />
    </div>
  );
};
