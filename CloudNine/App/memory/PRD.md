# AIRX — Real-Time Indian Airfare Price Intelligence Dashboard (SIH26056)

## Original Problem Statement
Build a government-grade data intelligence dashboard for the Statistical System of India (NSO, RBI, MoCA) that measures the domestic airfare price index (APIx), tracks CPI transmission, and provides route-level intelligence. Theme = "Midnight Aviation Intelligence" (dark navy, restrained accent colours). Uses a real 33MB `airfare_master.csv` dataset (98,757 observations, 36 routes, 5 airlines, 4 sources, 2 scrape dates).

## User Personas
1. **Policy Analyst (NSO/RBI)** — needs the Policy Intelligence briefing, CPI transmission, high-pressure route watchlist.
2. **Data Scientist / Statistician** — needs raw observation explorer, methodology, validation vs DGCA benchmark, data quality pipeline.
3. **Aviation Ministry Officer (MoCA)** — needs route pressure map, airline breakdown, lead-time economics.

## Core Requirements
- Dark-navy theme (#08111F bg, #101D2D cards, #1E3145 borders, #35A7FF accent).
- Manrope + IBM Plex Mono typography.
- Policy Intelligence Mode as default landing; Analyst Mode toggle.
- Real dataset numbers: APIx = 100.43 (+0.43%), 36 routes, 5 airlines, 98,722 valid obs / 98,757 total (99.965%), CPI contribution +0.00033 pp.
- 14 fully-wired navigation sections + REST API explorer.
- AI Market Insight via Emergent LLM key (OpenAI GPT-5.4) with deterministic fallback.
- CPI sensitivity simulator with ATF fuel-shock and demand multiplier sliders.

## Implemented (27 Feb 2026)
- **Backend**: FastAPI + Pandas + Motor (Mongo unused so far). CSV loaded on startup by `analytics_engine.py`. Endpoints: `/api/overview`, `/api/index-series`, `/api/routes`, `/api/routes/{o}/{d}`, `/api/lead-time`, `/api/airlines`, `/api/fare-components`, `/api/data-quality`, `/api/validation`, `/api/cpi-sensitivity`, `/api/cpi-sensitivity/simulate`, `/api/alerts`, `/api/raw-data`, `/api/pipeline/trigger-scrape`, `/api/ai/explain`, plus versioned `/api/v1/*` bundle.
- **Frontend**: React SPA with Sidebar + Navbar + 15 views wired via `activeTab` state.
    - Policy Intelligence Mode (default) — executive briefing, CPI simulator, route watchlist.
    - Analyst Overview — Hero KPIs, APIx chart with DGCA benchmark overlay, drivers panel with AI insight, India route map, watchlist.
    - Airfare Index, Route Intelligence, Lead-Time, Airlines, Fare Components, CPI Sensitivity, Data Quality, Validation, Data Pipeline DAG, Raw Data explorer, Alerts, Methodology, REST API explorer.
- **Design**: Midnight Aviation theme. All KPIs numeric-mono, dashboard-scale spacing, restrained colour usage.
- **AI**: Emergent LLM key wired for `openai gpt-5.4`. Deterministic fallback always available.

## Prioritised Backlog
- **P1**: Persist raw CSV rows in Mongo instead of in-memory Pandas for horizontal scaling.
- **P1**: Live scrape connector for real IndiGo/AI/AI Express/Akasa/SpiceJet feeds.
- **P2**: PDF export of Policy briefing.
- **P2**: Historical index archive (>2 scrape days).
- **P2**: Auth (X-API-Key) for `/api/v1/*` (NSO ingest).

## Test Credentials
None yet — dashboard is currently open-access read-only.

## Files of Reference
- `/app/backend/server.py` — FastAPI routes
- `/app/backend/analytics_engine.py` — Pandas pipeline & metrics
- `/app/backend/airfare_master.csv` — 33MB dataset
- `/app/frontend/src/App.js` — router, mode toggle, state hydration
- `/app/frontend/src/views/*.jsx` — 15 view components
- `/app/frontend/src/components/layout/{Navbar,Sidebar}.jsx`
- `/app/frontend/src/components/common/IndiaRouteMap.jsx`
- `/app/frontend/src/constants/testIds.js`
- `/app/design_guidelines.json`
