import type { TruthSource } from '../data/truthSource';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const makeRhythmItemId = (time: string, task: string) => `${time}__${slugify(task)}`;

export type RhythmReferenceItem = {
  id: string;
  time: string;
  task: string;
};

export const buildRhythmReference = (
  dailyRhythm: TruthSource['daily_rhythm']
): RhythmReferenceItem[] =>
  dailyRhythm.flatMap((entry) =>
    entry.items.map((task) => ({
      id: makeRhythmItemId(entry.time, task),
      time: entry.time,
      task
    }))
  );

export const buildRhythmReferenceMap = (dailyRhythm: TruthSource['daily_rhythm']) => {
  const reference = buildRhythmReference(dailyRhythm);
  return new Map(reference.map((item) => [item.id, item]));
};
