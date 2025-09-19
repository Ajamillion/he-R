const toInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDate = (value: string) => new Date(`${value}T00:00:00`);

export const toDateInputValue = (date: Date) => toInputValue(date);

export const todayInputValue = () => toInputValue(new Date());

export const shiftDate = (value: string, deltaDays: number) => {
  const date = toDate(value);
  date.setDate(date.getDate() + deltaDays);
  return toInputValue(date);
};

export const getLookbackRange = (end: string, days: number) => {
  const safeDays = Math.max(0, Math.floor(days));
  const range: string[] = [];
  for (let index = safeDays - 1; index >= 0; index -= 1) {
    range.push(shiftDate(end, -index));
  }
  return range;
};

export const toTimeInputValue = (date: Date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateFriendly = (value: string) => {
  const date = toDate(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
};

export const formatDateTimeFriendly = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};
