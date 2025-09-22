# HE•R Companion

A Vite + React TypeScript starter that turns the hepatic encephalopathy truth source into a daily companion app. The experience is mobile-friendly, cloud-ready (with a mocked sync layer), and organizes medication, hydration, stool quality, and supportive habits in one responsive dashboard.

## Features

- **Truth-source aware UI** – Daily rhythm timeline, medication library, spacing rules, and risk guidance are rendered directly from the structured HE data model.
- **Actionable tracking** – Hydration, stool, and medication logs with contextual guidance, spacing alerts, and PEG titration suggestions based on the titration policy.
- **Trend insights** – Seven-day hydration, stool, and medication summaries surface wins and gaps automatically.
- **Daily rhythm checklist** – Check off wake-to-evening habits to reinforce adherence and visualize progress streaks.
- **Shareable export** – Copy or download a JSON snapshot or spreadsheet CSV for caregivers, clinicians, or backups.
- **Precipitating factor tracker** – Toggle hepatic encephalopathy triggers and capture timestamped notes for the team.
- **Lab cadence tracker** – Record the most recent labs, surface the next draw window, and follow electrolyte actions at a glance.
- **Mobile-first layout** – Responsive cards and inputs tuned for touch, with a PWA manifest and gradient theming for at-a-glance clarity.
- **Cloud sync façade** – A sync banner simulates connectivity states and can be wired to a real backend or serverless function later.
- **Local persistence hook** – State is saved in `localStorage` so the experience survives refreshes while offline.

## Getting started

```bash
# install dependencies
npm install

# run the dev server
npm run dev

# type-check and build for production
npm run build

# run the component test suite (vitest + RTL)
npm test
```

> ℹ️ This template ships without generated artefacts (no `node_modules`). Run `npm install` before executing the scripts above.

## Project structure

```
├── index.html            # Vite entry with PWA manifest link
├── public/
│   ├── favicon.svg
│   └── manifest.webmanifest
├── src/
│   ├── App.tsx           # Dashboard composition
│   ├── components/       # Shared UI primitives (Card, etc.)
│   ├── data/truthSource.ts
│   ├── features/         # Feature cards + forms
│   ├── hooks/            # Local storage hook
│   ├── state/            # Plan context + storage model
│   ├── styles/           # Global theming
│   └── utils/            # Date/time helpers
└── package.json
```

## Roadmap & phased delivery

- [Status Snapshot & Forecast](docs/STATUS.md) – current completion estimates, time-to-ready outlook, and immediate action items.
- [HE•R Companion Roadmap](docs/ROADMAP.md) – multi-phase plan covering foundation hardening, MVP rollout, connected care, and scale readiness milestones.
- [Plan Export Formats](docs/EXPORTS.md) – JSON snapshot contract and spreadsheet CSV layout for care-team workflows.

## Extending the cloud layer

The `PlanContext` exposes `syncWithCloud`, `cloudState`, and `lastSyncedAt`. Replace the mocked promise in `syncWithCloud` with your preferred API client to back the logs with Supabase, Firebase, or custom infrastructure. The local store already serializes cleanly for network transport.

## Licensing

This starter is provided as-is for prototyping the HE•R companion experience. Add licensing terms here when you are ready to distribute.
