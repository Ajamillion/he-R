# Status Snapshot & Forecast

_Last updated: 2025-09-19_

## Completion Estimates

| Stream | Current Status | Completion % | Notes |
| --- | --- | --- | --- |
| Phase 0 · Foundation | Core dashboard, truth-source ingestion, spacing/titration rules, persistence scaffolding, and runtime validation are live. Remaining work centers on CI automations and accessibility review. | 75% | Validation suite and regional settings landed; unblock tooling installs and add CI/a11y coverage. |
| Phase 1 · Guided Companion | Daily logging flows exist, but exports, sharing, analytics, and native packaging are outstanding. | 20% | MVP needs CSV/PDF export, secure share flows, instrumentation, and Capacitor shells. |
| Phase 2 · Connected Care | Not started. | 0% | Requires backend selection, auth, sync, and clinician dashboard. |
| Cross-cutting workstreams | Documentation, tests, and design system seeds exist, but automated quality and compliance tracks are still forming. | 35% | Truth-source validation shipped; next up are CI jobs, accessibility backlog, and security checklist. |

## Time-to-Ready Forecast

| Milestone | Target Date | Confidence | Key Gating Work |
| --- | --- | --- | --- |
| Phase 0 exit (foundation ready) | 2025-10-02 | Medium | Restore registry access, run new validation tests in CI, and publish accessibility remediation backlog. |
| Phase 1 MVP beta (pilot) | 2025-11-13 | Low-Medium | Deliver export/share flows, instrumentation, offline smoke tests, and native wrappers. |
| Phase 2 connected trial | 2026-01-08 | Low | Backend + auth implementation, clinician oversight surface, alerting. |

## Immediate Actions

1. Resolve npm registry access so dependencies install and validation tests can run.
2. Stand up lint/type/test CI job definitions once dependency installs succeed.
3. Publish accessibility issue log and draft pilot caregiver onboarding + instrumentation plan.

## Risks & Mitigations (Updated)

- **Dependency on registry access for tooling installs** – Mirror dependencies or vend offline tarballs while CI is offline; prioritize internal registry setup.
- **Clinical sign-off timing** – Schedule recurring reviews with the hepatic encephalopathy board to unblock MVP gating criteria.
- **Native shell timeline** – Parallelize Capacitor setup with export/share work to absorb store review lag.

---
This snapshot should be refreshed every two weeks or when the roadmap scope/timeline changes materially.
