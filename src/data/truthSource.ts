import { parseTruthSource } from './truthSourceValidation';

const truthSourceData = {
  version: '0.6',
  kb_date: '2025-09-18',
  provenance: {
    kb_sha: '<populate_with_pdf_or_doc_hash>',
    rules_sha: '<filled_by_ci>'
  },
  units: {
    powder: 'g',
    liquid: 'mL',
    tablet: 'mg'
  },
  targets: {
    protein_g_per_kg_day: {
      min: 1.2,
      mid: 1.35,
      max: 1.5,
      round_to: 5
    },
    hydration_oz_day: {
      min: 48,
      max: 64,
      default: 56
    },
    late_snack: 'casein or Greek yogurt/cottage cheese 30–40 g around 21:00',
    notes: ['Do not restrict protein in HE']
  },
  daily_rhythm: [
    { time: 'wake', items: ['Lemon water'] },
    { time: '+20m', items: ['PHGG 1/4 cap in 12 oz water'] },
    {
      time: '+40m',
      items: ['Breakfast', 'Thiamine ≥100 mg', 'Vitamin C 500–1000 mg', 'Omega-3 ~1 g', 'Protein 20–30 g (whey/RTD)']
    },
    { time: '+60m', items: ['PEG 3350 1/2 cap (titrate to 2–3 soft BMs)', 'Pedialyte 4–8 oz'] },
    { time: 'lunch', items: ['Protein meal', 'Low-gas veg', 'Starch (rice/potato)', 'Zinc 25–50 mg (away from fiber/iron/Ca)'] },
    { time: 'afternoon', items: ['Protein 20–30 g (RTD/yogurt)'] },
    { time: 'dinner', items: ['Evening meal', 'Vitamin D3 1000–2000 IU'] },
    { time: '~21:00', items: ['Slow protein 30–40 g (casein/Greek yogurt/cottage cheese)', 'Magnesium 200–400 mg'] }
  ],
  spacing_rules: [
    { a: 'PHGG', b: 'PEG', min_minutes: 60 },
    { a: 'Zinc', b: 'Fiber/Iron/Calcium/Dairy', min_minutes: 60 }
  ],
  titration: {
    peg_3350: {
      step_cap: 0.25,
      min_caps: 0.0,
      max_caps: 1.5,
      logic: 'if bms>3: -step; elif bms in [2,3]: hold; elif bms<2: +step'
    }
  },
  stool_quality: {
    bristol_goal: [4, 5],
    mapping: {
      1: 'increase catharsis (constipation)',
      2: 'increase catharsis (hard/lumpy)',
      3: 'consider small increase',
      4: 'goal (soft, smooth)',
      5: 'goal (soft blobs)',
      6: 'decrease catharsis (looser)',
      7: 'decrease catharsis (watery)'
    }
  },
  avoid_set: ['NSAID', 'ibuprofen', 'naproxen', 'turmeric', 'curcumin', 'green tea extract', 'zeolite'],
  med_library: [
    {
      name: 'Lactulose',
      route: ['PO', 'NG', 'PR'],
      first_line: true,
      sig_template: 'titrate to 2–3 soft BMs/day',
      formulation: {
        strength_per_15ml_g: 10,
        mg_per_ml: 667
      },
      maintenance: true,
      adjunct: false,
      clinician_only: true,
      logging: ['dose_ml', 'times_per_day', 'stool_count', 'bristol']
    },
    {
      name: 'PEG-ELS',
      route: ['PO'],
      first_line: false,
      sig_template: '4 L over 4–6 h (inpatient course)',
      maintenance: false,
      adjunct: false,
      clinician_only: true,
      course_flag: 'peg_els_course'
    },
    {
      name: 'Rifaximin',
      route: ['PO'],
      first_line: false,
      sig_template: '550 mg BID (or 400 mg TID per local)',
      maintenance: true,
      adjunct: true,
      clinician_only: true,
      availability_flag: 'rifaximin_available',
      access_fields: ['prior_auth', 'insurer', 'pharmacy', 'copay_usd', 'assistance_flag', 'prescriber_contact'],
      adherence_fields: ['pills_remaining', 'refill_date', 'missed_doses_7d']
    },
    {
      name: 'LOLA',
      route: ['PO', 'IV'],
      first_line: false,
      sig_template: 'PO 3 g TID (up to 18 g/day) or IV 20–30 g/day ×3–5 d',
      maintenance: true,
      adjunct: true,
      clinician_only: true,
      availability_flag: 'lola_available',
      safety: {
        renal_block_creatinine_mg_dl: 3.0,
        pregnancy_lactation_hidden: true
      }
    },
    {
      name: 'Lactitol',
      route: ['PO'],
      first_line: false,
      sig_template: 'titrate to 2–3 soft BMs/day',
      maintenance: true,
      adjunct: false,
      clinician_only: true,
      availability_flag: 'lactitol_available'
    },
    {
      name: 'Neomycin',
      route: ['PO'],
      first_line: false,
      sig_template: 'fallback; dosing per clinician',
      maintenance: true,
      adjunct: true,
      clinician_only: true
    },
    {
      name: 'Metronidazole',
      route: ['PO'],
      first_line: false,
      sig_template: 'fallback; dosing per clinician',
      maintenance: true,
      adjunct: true,
      clinician_only: true
    }
  ],
  staging_map: [
    { west_haven: 0, product_state: 'mhe' },
    { west_haven: 1, product_state: 'ohe_mild' },
    { west_haven: 2, product_state: 'ohe_mod' },
    { west_haven: 3, product_state: 'ohe_severe' },
    { west_haven: 4, product_state: 'emergent' }
  ],
  precipitating_factors: [
    'infection',
    'GI bleed',
    'constipation/impaction',
    'dehydration',
    'hyponatremia',
    'hypokalemia',
    'hypomagnesemia',
    'AKI/renal failure',
    'sedatives/benzodiazepines/opioids',
    'diuretic overuse',
    'large_shunt/TIPS',
    'recent_procedure',
    'new_medications'
  ],
  electrolyte_policy: {
    monitor: ['Na', 'K', 'Mg', 'Cr'],
    actions: ['hydrate', 'replete_K', 'replete_Mg', 'review_diuretics']
  },
  lab_cadence: {
    weeks: 8
  },
  region_flags: ['rifaximin_available', 'lactitol_available', 'lola_available'],
  driving_caution_states: ['mhe', 'ohe_mild', 'ohe_mod'],
  sleep_hygiene_tips: [
    'Regular wake time and daylight exposure',
    'Avoid late caffeine; short naps only',
    'Gentle wind-down routine',
    '21:00 slow protein supports overnight balance'
  ],
  microcopy_library: [
    'Titrate gently—aim for 2–3 soft BMs.',
    'PHGG first, PEG an hour later.',
    'Zinc at lunch—away from fiber/iron/Ca.',
    'LOLA is an adjunct—keep your stool plan.',
    'Late slow protein locks in gains.',
    'When in doubt, keep it simple and steady.'
  ]
} as const;

export type TruthSource = typeof truthSourceData;

export const truthSource: TruthSource = parseTruthSource(truthSourceData);
