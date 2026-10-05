# Production Airfare Data Collection & Indexing Agent

A production-quality Python-based real-time airfare data collection and indexing agent designed for Indian domestic flight routes. It scrapes flight search engines (EaseMyTrip, Ixigo, Google Flights, Mock Airline), normalizes into a standardized schema, validates data quality, deduplicates via SHA-256 composite fingerprint hashing, stores persistent observations in PostgreSQL/SQLite via SQLAlchemy, and outputs a clean master CSV (`data/airfare_master.csv`) and Parquet file for downstream AI agents.

---

## Key Features

- **Single-Click Execution**: Simple `python main.py` command triggers full real-time scraping, validation, deduplication, and master CSV updating.
- **Historical Price Trend Preservation**: Changed fares for the same flight and date create new historical observation records rather than overwriting valid past data.
- **Deduplication Engine**: Composite SHA-256 fingerprint hash prevents identical duplicate records.
- **Standardized Schema**: IATA 3-letter codes (`MAA`, `DEL`, `BOM`, `BLR`), clean numeric prices (no `₹` symbols), ISO 8601 UTC timestamps, 24-hour time formatting (`HH:MM`).
- **Resilient Pipeline**: Fault-isolated scrapers ensure that if one flight website fails, the agent continues collecting from all other enabled sources.
- **FastAPI & Modern Dashboard**: Embedded REST API endpoints and dark-mode web application for real-time monitoring and statistics visualization.

---

## Directory Structure

```
airfare_agent/
├── agent/
│   ├── __init__.py
│   └── orchestrator.py        # Core agent orchestrator & execution pipeline
├── scrapers/
│   ├── __init__.py
│   ├── base_scraper.py        # Abstract BaseScraper class interface
│   ├── easemytrip_scraper.py  # EaseMyTrip domestic flight scraper
│   ├── ixigo_scraper.py       # Ixigo flight scraper
│   ├── google_flights_scraper.py # Google Flights scraper
│   └── mock_scraper.py        # Deterministic mock scraper for offline testing
├── models/
│   ├── __init__.py
│   ├── airfare.py             # Pydantic schemas (AirfareObservation, SearchParams)
│   └── database.py            # SQLAlchemy ORM models
├── processing/
│   ├── __init__.py
│   ├── normalizer.py          # Airport IATA, currency, and date/time normalizer
│   ├── validator.py           # Data quality rules & schema validation
│   └── deduplicator.py        # SHA-256 fingerprint deduplication engine
├── database/
│   ├── __init__.py
│   ├── connection.py          # SQLAlchemy engine & session factory
│   └── repository.py          # Database queries & master dataset exporters
├── api/
│   ├── __init__.py
│   └── routes.py              # FastAPI REST API endpoints
├── config/
│   ├── sources.yaml           # Configurable scrapers toggle
│   └── routes.yaml            # Configurable target flight routes
├── data/
│   ├── airfare_master.csv     # Master dataset generated from DB
│   └── airfare_master.parquet # Parquet dataset for high-performance processing
├── static/
│   └── index.html             # Glassmorphic web dashboard UI
├── tests/                     # Pytest automated test suite
├── .env.example
├── requirements.txt
├── main.py                    # Single-click CLI entry point
└── README.md
```

---

## Quick Start

### 1. Single-Click Data Collection Run

To collect live airfare data across configured routes and update `data/airfare_master.csv`:

```bash
python main.py
```

### 2. Run Automated Test Suite

To run all unit and integration tests:

```bash
python -m pytest tests/
```

### 3. Launch REST API & Dashboard

To run the FastAPI server and open the interactive dashboard:

```bash
python main.py --server
```

Then visit `http://localhost:8000` in your web browser.

---

## Standardized Airfare Schema

| Column Name | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `observation_id` | String | `a8f9b2c...` | SHA-256 fingerprint hash unique to observation |
| `source_name` | String | `easemytrip` | Name of flight source |
| `source_type` | String | `ota` | Type of source (`ota` or `airline`) |
| `airline` | String | `IndiGo` | Airline brand |
| `flight_number` | String | `6E-204` | Flight code |
| `origin` | String | `MAA` | 3-letter IATA code for origin airport |
| `destination` | String | `DEL` | 3-letter IATA code for destination airport |
| `travel_date` | String | `2026-09-01` | Date of flight (YYYY-MM-DD) |
| `departure_time`| String | `06:00` | 24-hour departure time (HH:MM) |
| `arrival_time` | String | `08:15` | 24-hour arrival time (HH:MM) |
| `duration_minutes` | Integer | `135` | Flight duration in minutes |
| `stops` | Integer | `0` | Layovers (0 = Non-stop) |
| `cabin_class` | String | `Economy` | Cabin class |
| `total_fare` | Float | `5420.00` | Clean numeric total fare in INR |
| `currency` | String | `INR` | ISO currency code |
| `scraped_at` | String | `2026-08-26T00:30:00+00:00` | ISO 8601 UTC timestamp |
