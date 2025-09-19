# Status Snapshot & Forecast

_Last updated: 2025-09-21_

## Completion Estimates

| Stream | Current Status | Completion % | Notes |
| --- | --- | --- | --- |
| Phase 0 · Foundation | Core dashboard, lookback insights, truth-source ingestion, spacing/titration rules, and persistence scaffolding are live. Remaining work centers on CI automations and accessibility review. | 82% | Added lookback analytics and export snapshot plumbing; unblock tooling installs and add CI/a11y coverage. |
| Phase 1 · Guided Companion | Daily logging, insights, and JSON export exist, but PDF outputs, sharing, analytics, and native packaging are outstanding. | 28% | CSV log schema, precipitating factor tracker, and export notes are live; next deliverables are richer share UX, instrumentation, and Capacitor shells. |
| Phase 2 · Connected Care | Not started. | 0% | Requires backend selection, auth, sync, and clinician dashboard. |
| Cross-cutting workstreams | Documentation, tests, and design system seeds exist; automated quality and compliance tracks are emerging. | 40% | Added factor tracker coverage to plan logic/provider tests; next up are CI jobs, accessibility backlog, and security checklist. |

## Time-to-Ready Forecast

| Milestone | Target Date | Confidence | Key Gating Work |
| --- | --- | --- | --- |
| Phase 0 exit (foundation ready) | 2025-10-02 | Medium | Restore registry access, run new validation tests in CI, and publish accessibility remediation backlog. |
| Phase 1 MVP beta (pilot) | 2025-11-13 | Low-Medium | Deliver export/share flows (JSON→CSV/PDF), instrumentation, offline smoke tests, and native wrappers. |
| Phase 2 connected trial | 2026-01-08 | Low | Backend + auth implementation, clinician oversight surface, alerting. |

## Immediate Actions

1. Resolve npm registry access so dependencies install and validation tests can run.
2. Stand up lint/type/test CI job definitions once dependency installs succeed, covering new plan logic analytics/export suites.
3. Publish accessibility issue log and draft pilot caregiver onboarding + instrumentation plan.
4. Extend the export spec to cover the PDF clinician packet—CSV and factor tracker contracts now documented in `docs/EXPORTS.md`.

## Risks & Mitigations (Updated)

- **Dependency on registry access for tooling installs** – Mirror dependencies or vend offline tarballs while CI is offline; prioritize internal registry setup.
- **Clinical sign-off timing** – Schedule recurring reviews with the hepatic encephalopathy board to unblock MVP gating criteria.
- **Native shell timeline** – Parallelize Capacitor setup with export/share work to absorb store review lag.

---
This snapshot should be refreshed every two weeks or when the roadmap scope/timeline changes materially.
