import { describe, expect, it } from 'vitest';
import { truthSource } from './truthSource';
import { parseTruthSource } from './truthSourceValidation';

describe('parseTruthSource', () => {
  it('returns the truth source when it matches the expected shape', () => {
    const result = parseTruthSource(truthSource);
    expect(result).toEqual(truthSource);
  });

  it('throws when required fields are missing', () => {
    const invalid = { ...(truthSource as unknown as Record<string, unknown>), version: '' };
    expect(() => parseTruthSource(invalid)).toThrow(/version/);
  });
});
