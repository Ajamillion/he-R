# Export formats

The HE•R Companion exposes export utilities so caregivers and clinicians can archive plan data,
perform quick reviews, or feed the information into downstream tooling. Two complementary formats
ship out of the box: a structured JSON snapshot and a spreadsheet-friendly CSV log extract.

## JSON snapshot (`buildPlanExportSnapshot`)

The JSON export is a lossless representation of the locally persisted plan state. It is designed
for backups, care-team handoffs, and eventual cloud synchronization. Every field is typed in
`src/state/planLogic.ts` via `PlanExportSnapshot`.

### Envelope fields

| Field | Description |
| --- | --- |
| `generatedAt` | ISO timestamp when the snapshot was created. |
| `truthVersion` | Version string from the hepatic encephalopathy truth source. |
| `profile` | Current profile settings (`weightKg`, `hydrationGoalOz`, and `regionFlags`). |
| `pegCaps` | Current PEG 3350 capsule setting used by the titration helper. |
| `lastSyncedAt` | Timestamp of the most recent cloud sync (if any). |
| `precipitatingFactors` | Array capturing the status, notes, and last update per precipitating factor. |
| `totals` | Counts of hydration, stool, and medication entries across the snapshot. |
| `logs` | Array of sanitized daily logs ordered chronologically. |

### Daily log payload

Each entry in `logs` is stripped of internal identifiers and sorted for deterministic outputs:

- `date` – ISO date of the log.
- `hydration` – Array of `{ time, ounces }` entries sorted by time.
- `stool` – Array of `{ time, bristol }` entries sorted by time.
- `medications` – Array of `{ time, name, amount }` entries sorted by time.
- `notes` – Optional care note string when present.

Consumers can round-trip the data back into the application or enrich it for analytics pipelines.

### Precipitating factor payload

Each element of `precipitatingFactors` contains:

- `name` – Factor label from the truth source.
- `active` – Boolean flag indicating whether the trigger is present.
- `note` – Optional trimmed note providing context for the team.
- `updatedAt` – ISO timestamp of the most recent change (present when a toggle or note update occurred).

## CSV log extract (`buildPlanExportCsv`)

The CSV export flattens the snapshot into a spreadsheet-ready table with high-signal metadata at the
top. It is optimized for charting, quick reviews during clinic visits, and ad-hoc calculations.

### Metadata rows

The first block of rows provides context that would otherwise live outside the sheet:

1. `Generated at` – Snapshot timestamp.
2. `Truth version` – Version of the truth source backing this export.
3. `Last synced at` – Cloud sync timestamp or `Not yet synced`.
4. `PEG 3350 caps` – Current PEG titration setting.
5. `Body weight (kg)` – Weight used for protein calculations.
6. `Hydration goal (oz)` – Personalized hydration target.
7. `Region flags enabled` – Semicolon-delimited list of enabled regional availability flags (`None` when all are disabled).
8. `Active precipitating factors` – Semicolon-delimited list of currently active triggers (`None` when all are clear).
9. `Factors with notes` – Count of factors carrying caregiver notes.

All metadata rows pad remaining columns with empty values to keep a consistent 5-column layout.

### Factor tracker table

A second metadata block surfaces the state of every precipitating factor before the daily logs:

| Column | Contents |
| --- | --- |
| `Precipitating factor` | Factor name. |
| `Status` | `Active` or `Clear`. |
| `Last updated` | ISO timestamp or `—` when untouched. |
| `Notes` | Context captured in the tracker. |

The final column in the row is blank to preserve the 5-column width. Downstream tooling can
filter or pivot on the factor table before ingesting the detailed log rows.

### Log columns

After a blank spacer row the table header is emitted:

| Column | Contents |
| --- | --- |
| `Date` | Log date in ISO format. |
| `Time` | Entry time (HH:MM); blank for notes. |
| `Category` | One of `Hydration`, `Stool`, `Medication`, or `Notes`. |
| `Item` | Human-readable label (`Hydration`, `Bristol X`, medication name, or `Care note`). |
| `Amount or Notes` | Quantified value (e.g., `10 oz`, `Type 4`, `550 mg`) or the free-text note. |

Hydration, stool, and medication entries respect chronological ordering within their day.
Notes appear once per day when present. Special characters are escaped per RFC 4180 so commas or
line breaks survive spreadsheet imports.

### Recommended usage

- **Clinicians** can filter or pivot on the `Category` column to focus on hydration vs. stool vs.
  medication patterns.
- **Caregivers** can append annotations in a dedicated column without disturbing the exported data.
- **Data analysts** can ingest the CSV into BI tools for lightweight dashboards while retaining the
  JSON snapshot for full-fidelity archives.

Both exports share the same source data, so downstream consumers can choose the format that best
matches their workflow.
