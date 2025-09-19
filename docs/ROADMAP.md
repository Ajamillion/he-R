# HE•R Companion Roadmap

This roadmap translates the hepatic encephalopathy (HE) truth source into a phased delivery plan for a cross-platform companion experience. Each phase compounds on the previous one so we can de-risk core flows early, collect feedback from caregivers and clinicians, and introduce regulated capabilities with appropriate oversight.

## Product Vision
- **For** people managing recurrent HE episodes, their caregivers, and remote care teams.
- **Who need** daily structure, medication adherence support, hydration and stool monitoring, and contextual education tailored to hepatic encephalopathy.
- **The HE•R companion** delivers a trusted, always-on guide across web, mobile, and cloud surfaces that keeps everyone aligned on the plan.
- **Unlike** paper trackers or siloed apps, HE•R codifies clinician-approved protocols (titration, spacing, contraindications) directly in the experience and syncs safely with the care team.

## Guiding Principles
1. **Truth-source first** – Every recommendation, limit, and titration rule originates from the shared JSON source of truth so the UI stays clinically accurate.
2. **Progressive rollout** – Release functionality in slices that deliver value independently (logkeeping, coaching, coordination) to minimize risk.
3. **Cross-platform from day one** – Develop in Vite + React with responsive design, wrap in Capacitor for native stores, and deliver a PWA for desktop/tablet usage.
4. **Privacy & compliance aware** – Bake in PHI safeguards, audit trails, and consent flows before enabling any data sharing beyond the local device.
5. **Clinician control** – Provide guardrails for clinician-only actions (med titration overrides, adjunct therapies) and capture context for remote review.

## Release Phases
Each phase lists primary outcomes, the major workstreams, and the go/no-go criteria required to advance.

### Phase 0 · Foundation & Alignment (Weeks 0–2)
**Objectives**
- Validate the truth-source schema, plan context, and local persistence model.
- Establish the UX skeleton, theming system, and CI scaffolding.
- Align caregivers, clinicians, and engineering on terminology and success metrics.

**Delivery slices**
- Harden the current Vite workspace, TypeScript types, and lint/test baselines.
- Convert the structured HE JSON into typed domain models with runtime guards.
- Produce responsive card primitives, spacing grid, and baseline accessibility pass (keyboard navigation, color contrast).
- Author initial PWA manifest, icons, and offline caching strategy for the static shell.
- Draft product requirement docs (PRD), Definition of Ready/Done, and release checklist.

**Exit criteria**
- Truth-source can be validated at build time and hydrated at runtime without manual edits.
- App shell renders the daily dashboard with sample data across mobile + desktop breakpoints.
- CI runs lint, type-check, unit tests, and bundle size reports on each branch.
- Stakeholders sign off on terminology, success metrics, and instrumentation plan.

### Phase 1 · Guided Daily Companion (Weeks 3–6)
**Objectives**
- Ship an MVP that supports single-user daily tracking with local-first persistence.
- Provide actionable coaching for hydration, stool quality, and medication adherence.
- Enable export/sharing workflows without yet storing PHI in the cloud.

**Delivery slices**
- Build log editors for hydration, stool counts, Bristol scale, medication doses, and notes—backed by validation derived from the truth source.
- Implement spacing/titration rule engines with inline alerts and contextual microcopy.
- Add hydration + protein goal calculators (weight-based) and late-snack nudges.
- Introduce CSV/PDF export of daily logs for clinic visits; include share via secure email draft.
- Instrument usage analytics (privacy-preserving) and error logging.
- Wrap the web app with Capacitor for iOS/Android test builds; configure push-ready notification channels (silent for now).

**Exit criteria**
- Core tracking flows usable offline with data persistence across sessions.
- Accessibility audit (WCAG 2.1 AA focus) passes or has mitigations.
- MVP release candidate signed off by clinical reviewer and pilot caregiver group.
- App packaged for TestFlight/Internal testing with install + smoke scripts documented.

### Phase 2 · Connected Care & Cloud Sync (Weeks 7–12)
**Objectives**
- Introduce secure cloud synchronization, clinician oversight, and alerting.
- Support multi-user plans (caregiver + clinician) with consent-driven access.

**Delivery slices**
- Stand up a Supabase/Firebase backend (decision pending) with row-level security tied to plan membership.
- Implement authenticated sync for logs, plan revisions, medication courses, and titration adjustments with optimistic updates and conflict resolution strategies.
- Add clinician-only controls (adjunct therapies, PEG titration overrides) gated behind role-based access.
- Deliver notification preferences and triggered alerts (e.g., missed doses, stool outside Bristol target, dehydration risk).
- Build care-team inbox: timeline of precipitating factors, lab cadence reminders, and sync history.
- Run threat modeling, integrate secure storage (Keychain/Keystore) for tokens, and log access events for audits.

**Exit criteria**
- Data sync proven across devices with automated integration tests and manual QA runs.
- HIPAA-aligned technical safeguards reviewed (encryption in transit/rest, access logs, disaster recovery).
- Clinician portal (web) surfaces plan status, alerts, and exportable summaries.
- Pilot cohort completes a 4-week connected trial with satisfaction + adherence metrics collected.

### Phase 3 · Intelligence, Automation & Scale (Weeks 13–20)
**Objectives**
- Layer predictive insights, automated nudges, and integrations with EHR/dispensary systems.
- Prepare the product for broader rollout with self-service onboarding and observability.

**Delivery slices**
- Train lightweight models on anonymized data to forecast risk of HE flare (e.g., stool/hydration patterns) and recommend proactive actions.
- Automate peg 3350 titration suggestions with trend analysis and clinician override workflows.
- Integrate with pharmacy APIs for refill status and prior authorization updates.
- Add wearable/IoT hydration integrations (Apple HealthKit, Google Fit) with opt-in controls.
- Build self-service onboarding wizard, consent capture, and localization pipeline.
- Enhance observability (structured logs, metrics dashboards, on-call runbooks) and SLO tracking.

**Exit criteria**
- Predictive insights validated against clinician benchmarks with false-positive thresholds defined.
- External integrations pass security review and have contingency plans.
- Production readiness review approves scalability, monitoring, and support plans.
- Go-to-market assets (app store listings, clinician enablement kit) completed.

## Cross-Cutting Workstreams
- **Clinical governance** – Monthly review board, redline process for truth-source updates, release notes for clinicians.
- **Content & UX** – Inclusive language, caregiver feedback loops, multilingual support (Spanish priority), in-app education library roadmap.
- **Quality & Testing** – Unit + component tests per feature, E2E regression suite (Playwright), device lab coverage for low-end Android.
- **Security & Compliance** – Privacy impact assessments, SOC2/HIPAA readiness, data retention policies, incident response runbooks.
- **Data & Analytics** – Event taxonomy, dashboards for adherence, hydration, stool quality trends, AB testing infrastructure (feature flags).
- **Deployment & DevOps** – CI/CD pipelines, environment promotion (dev/staging/prod), infrastructure as code, backup/restore drills.

## Milestones & Governance
| Milestone | Target | Deliverables | Owner(s) |
| --- | --- | --- | --- |
| M0 Alignment | End of Week 2 | Phase 0 exit criteria met, roadmap + KPIs socialized | Product + Clinical + Eng leads |
| MVP Beta | End of Week 6 | Phase 1 release to pilot caregivers, feedback plan active | Product + Design |
| Connected Trial | End of Week 12 | Phase 2 release with clinician dashboard + sync | Eng + Clinical |
| Scale Readiness | End of Week 20 | Phase 3 capabilities, compliance sign-off, GTM assets | Leadership team |

## Immediate Next Steps (Phase 0 focus)
1. **Truth-source validation** – Add schema validation (zod/io-ts) and integration tests around spacing/titration logic.
2. **Design tokens** – Extract colors, spacing, typography into a centralized system for reuse across web/PWA/Capacitor shells.
3. **Accessibility audit** – Run linting (eslint-plugin-jsx-a11y) and manual keyboard testing; document remediation tasks.
4. **CI hardening** – Configure GitHub Actions (or alternative) to run lint, type-check, Vitest, and Lighthouse CI on pull requests.
5. **Documentation pack** – Publish API reference for PlanContext, state diagrams, and pilot onboarding guide.

## Measuring Success
- **Adherence** – % of logged doses/hydration entries vs. prescribed plan.
- **Symptom control** – Trend of Bristol scores hitting the goal range and PEG titration adjustments needed.
- **Engagement** – Daily active caregivers, clinician check-ins, export usage.
- **Reliability** – Sync success rate, offline queue flush time, crash-free sessions.
- **Satisfaction** – Net promoter from caregivers/clinicians, qualitative feedback on clarity and burden reduction.

## Risks & Mitigation
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Dependency on accurate truth-source updates | Incorrect guidance | Versioned schema, clinician review gates, change logs |
| Cloud sync security gaps | PHI exposure | Zero-trust design, encryption, pen-testing before enabling multi-user sync |
| Caregiver adoption friction | Low engagement | Conduct usability studies, add micro-interactions (progress streaks), integrate reminders |
| Regulatory changes | Release delays | Maintain compliance backlog, periodic legal consults, feature flags for regional policies |
| Cross-platform complexity | App store rejection or UX drift | Shared design system, automated visual regression, Capacitor upgrade cadence |

## Communication Cadence
- Weekly triad sync (Product, Engineering, Clinical) reviewing roadmap burn-down.
- Bi-weekly pilot caregiver feedback sessions.
- Monthly stakeholder newsletter summarizing metrics, upcoming releases, and clinical updates.

---
This document should be revisited at each milestone to reflect learnings, updated timelines, and scope adjustments.
