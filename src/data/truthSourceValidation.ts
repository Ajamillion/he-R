const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const ensureString = (value: unknown, path: string, issues: string[]) => {
  if (!isString(value) || value.trim().length === 0) {
    issues.push(`${path} must be a non-empty string`);
  }
};

const ensureNumber = (value: unknown, path: string, issues: string[]) => {
  if (!isNumber(value)) {
    issues.push(`${path} must be a finite number`);
  }
};

const ensureBoolean = (value: unknown, path: string, issues: string[]) => {
  if (typeof value !== 'boolean') {
    issues.push(`${path} must be a boolean`);
  }
};

const ensureStringArray = (value: unknown, path: string, issues: string[]): string[] => {
  if (!Array.isArray(value)) {
    issues.push(`${path} must be an array`);
    return [];
  }
  value.forEach((entry, index) => {
    if (!isString(entry) || entry.trim().length === 0) {
      issues.push(`${path}[${index}] must be a non-empty string`);
    }
  });
  return value as string[];
};

const ensureObjectArray = (
  value: unknown,
  path: string,
  issues: string[]
): Record<string, unknown>[] => {
  if (!Array.isArray(value)) {
    issues.push(`${path} must be an array`);
    return [];
  }
  return value.map((entry, index) => {
    if (!isObjectRecord(entry)) {
      issues.push(`${path}[${index}] must be an object`);
      return {};
    }
    return entry;
  });
};

export const parseTruthSource = <T>(input: T): T => {
  const issues: string[] = [];
  const data = input as unknown;

  if (!isObjectRecord(data)) {
    throw new Error('Truth source validation failed: root must be an object');
  }

  ensureString(data.version, 'version', issues);
  ensureString(data.kb_date, 'kb_date', issues);

  if (isObjectRecord(data.provenance)) {
    ensureString(data.provenance.kb_sha, 'provenance.kb_sha', issues);
    ensureString(data.provenance.rules_sha, 'provenance.rules_sha', issues);
  } else {
    issues.push('provenance must be an object');
  }

  if (isObjectRecord(data.units)) {
    Object.entries(data.units).forEach(([key, value]) => ensureString(value, `units.${key}`, issues));
  } else {
    issues.push('units must be an object with string values');
  }

  if (isObjectRecord(data.targets)) {
    const protein = isObjectRecord(data.targets.protein_g_per_kg_day)
      ? data.targets.protein_g_per_kg_day
      : undefined;
    if (protein) {
      ensureNumber(protein.min, 'targets.protein_g_per_kg_day.min', issues);
      ensureNumber(protein.mid, 'targets.protein_g_per_kg_day.mid', issues);
      ensureNumber(protein.max, 'targets.protein_g_per_kg_day.max', issues);
      ensureNumber(protein.round_to, 'targets.protein_g_per_kg_day.round_to', issues);
    } else {
      issues.push('targets.protein_g_per_kg_day must be an object');
    }

    if (isObjectRecord(data.targets.hydration_oz_day)) {
      const hydration = data.targets.hydration_oz_day;
      ensureNumber(hydration.min, 'targets.hydration_oz_day.min', issues);
      ensureNumber(hydration.max, 'targets.hydration_oz_day.max', issues);
      ensureNumber(hydration.default, 'targets.hydration_oz_day.default', issues);
    } else {
      issues.push('targets.hydration_oz_day must be an object');
    }

    ensureString(data.targets.late_snack, 'targets.late_snack', issues);
    if (Array.isArray(data.targets.notes)) {
      data.targets.notes.forEach((note: unknown, index: number) =>
        ensureString(note, `targets.notes[${index}]`, issues)
      );
    } else {
      issues.push('targets.notes must be an array of strings');
    }
  } else {
    issues.push('targets must be an object');
  }

  ensureObjectArray(data.daily_rhythm, 'daily_rhythm', issues).forEach((entry, index) => {
    ensureString(entry.time, `daily_rhythm[${index}].time`, issues);
    ensureStringArray(entry.items, `daily_rhythm[${index}].items`, issues);
  });

  ensureObjectArray(data.spacing_rules, 'spacing_rules', issues).forEach((rule, index) => {
    ensureString(rule.a, `spacing_rules[${index}].a`, issues);
    ensureString(rule.b, `spacing_rules[${index}].b`, issues);
    ensureNumber(rule.min_minutes, `spacing_rules[${index}].min_minutes`, issues);
  });

  if (isObjectRecord(data.titration) && isObjectRecord(data.titration.peg_3350)) {
    const peg = data.titration.peg_3350;
    ensureNumber(peg.step_cap, 'titration.peg_3350.step_cap', issues);
    ensureNumber(peg.min_caps, 'titration.peg_3350.min_caps', issues);
    ensureNumber(peg.max_caps, 'titration.peg_3350.max_caps', issues);
    ensureString(peg.logic, 'titration.peg_3350.logic', issues);
  } else {
    issues.push('titration.peg_3350 must be an object');
  }

  if (isObjectRecord(data.stool_quality)) {
    if (Array.isArray(data.stool_quality.bristol_goal)) {
      data.stool_quality.bristol_goal.forEach((value: unknown, index: number) =>
        ensureNumber(value, `stool_quality.bristol_goal[${index}]`, issues)
      );
    } else {
      issues.push('stool_quality.bristol_goal must be an array of numbers');
    }
    if (isObjectRecord(data.stool_quality.mapping)) {
      Object.entries(data.stool_quality.mapping).forEach(([key, value]) =>
        ensureString(value, `stool_quality.mapping.${key}`, issues)
      );
    } else {
      issues.push('stool_quality.mapping must be an object');
    }
  } else {
    issues.push('stool_quality must be an object');
  }

  ensureStringArray(data.avoid_set, 'avoid_set', issues);

  ensureObjectArray(data.med_library, 'med_library', issues).forEach((med, index) => {
    ensureString(med.name, `med_library[${index}].name`, issues);
    ensureStringArray(med.route, `med_library[${index}].route`, issues);
    if ('first_line' in med) {
      ensureBoolean(med.first_line, `med_library[${index}].first_line`, issues);
    }
    if ('maintenance' in med) {
      ensureBoolean(med.maintenance, `med_library[${index}].maintenance`, issues);
    }
    if ('adjunct' in med) {
      ensureBoolean(med.adjunct, `med_library[${index}].adjunct`, issues);
    }
    if ('clinician_only' in med) {
      ensureBoolean(med.clinician_only, `med_library[${index}].clinician_only`, issues);
    }
    if ('formulation' in med && med.formulation && isObjectRecord(med.formulation)) {
      ensureNumber(med.formulation.strength_per_15ml_g, `med_library[${index}].formulation.strength_per_15ml_g`, issues);
      ensureNumber(med.formulation.mg_per_ml, `med_library[${index}].formulation.mg_per_ml`, issues);
    }
    if ('logging' in med) {
      ensureStringArray(med.logging, `med_library[${index}].logging`, issues);
    }
    if ('access_fields' in med) {
      ensureStringArray(med.access_fields, `med_library[${index}].access_fields`, issues);
    }
    if ('adherence_fields' in med) {
      ensureStringArray(med.adherence_fields, `med_library[${index}].adherence_fields`, issues);
    }
    if ('safety' in med && med.safety && isObjectRecord(med.safety)) {
      if ('renal_block_creatinine_mg_dl' in med.safety) {
        ensureNumber(
          med.safety.renal_block_creatinine_mg_dl,
          `med_library[${index}].safety.renal_block_creatinine_mg_dl`,
          issues
        );
      }
      if ('pregnancy_lactation_hidden' in med.safety) {
        ensureBoolean(
          med.safety.pregnancy_lactation_hidden,
          `med_library[${index}].safety.pregnancy_lactation_hidden`,
          issues
        );
      }
    }
  });

  ensureObjectArray(data.staging_map, 'staging_map', issues).forEach((item, index) => {
    ensureNumber(item.west_haven, `staging_map[${index}].west_haven`, issues);
    ensureString(item.product_state, `staging_map[${index}].product_state`, issues);
  });

  ensureStringArray(data.precipitating_factors, 'precipitating_factors', issues);

  if (isObjectRecord(data.electrolyte_policy)) {
    ensureStringArray(data.electrolyte_policy.monitor, 'electrolyte_policy.monitor', issues);
    ensureStringArray(data.electrolyte_policy.actions, 'electrolyte_policy.actions', issues);
  } else {
    issues.push('electrolyte_policy must be an object');
  }

  if (isObjectRecord(data.lab_cadence)) {
    ensureNumber(data.lab_cadence.weeks, 'lab_cadence.weeks', issues);
  } else {
    issues.push('lab_cadence must be an object');
  }

  ensureStringArray(data.region_flags, 'region_flags', issues);
  ensureStringArray(data.driving_caution_states, 'driving_caution_states', issues);
  ensureStringArray(data.sleep_hygiene_tips, 'sleep_hygiene_tips', issues);
  ensureStringArray(data.microcopy_library, 'microcopy_library', issues);

  if (issues.length > 0) {
    throw new Error(`Truth source validation failed: ${issues.join('; ')}`);
  }

  return input;
};
