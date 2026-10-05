"""
AIRFLEX REST API Routes
Problem Statement SIH26056: Real-Time Airfare Price Index
"""

import os
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from processing.ari_engine import engine

app = FastAPI(
    title="AIRFLEX — Real-Time Airfare Price Index API",
    description="Government-Grade Indian Airfare Price Index & Analytics API for SIH 2026 Problem Statement SIH26056",
    version="1.0.0"
)

# Mount static directory for glassmorphic UI assets
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
async def root():
    """Render AIRFLEX Dashboard Application."""
    index_path = static_dir / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse({"service": "AIRFLEX API", "status": "operational"})


@app.get("/health")
async def health():
    """Service health check."""
    return {"status": "ok", "service": "AIRFLEX Data Intelligence API", "version": "1.0.0"}


@app.get("/api/overview")
async def get_overview():
    """1. Headline Executive Dashboard KPIs."""
    return engine.get_overview_kpis()


@app.get("/api/ari/details")
async def get_ari_details():
    """2. Airfare Price Index breakdown & route contributions."""
    return engine.get_ari_details()


@app.get("/api/trends")
async def get_trends(period: str = Query("daily", description="daily, weekly, monthly")):
    """3. Daily, Weekly, Monthly Trends & Comparison."""
    return engine.get_trends(period=period)


@app.get("/api/routes-analysis")
async def get_routes_analysis(selected_route: Optional[str] = None):
    """4. Route-level analysis & airline comparisons."""
    return engine.get_route_analysis(selected_route=selected_route)


@app.get("/api/heatmap")
async def get_heatmap():
    """5. India Airport & Route Network Heatmap."""
    return engine.get_route_heatmap()


@app.get("/api/forecast")
async def get_forecast():
    """6. Forecast Horizons (T+1, T+7, T+15, T+30, T+45)."""
    return engine.get_forecast_horizons()


@app.get("/api/lead-time")
async def get_lead_time():
    """7. Days to Departure vs Average Fare curve."""
    return engine.get_lead_time_analysis()


@app.get("/api/fare-components")
async def get_fare_components():
    """8. Base Fare, Taxes, and Fees breakdown."""
    return engine.get_fare_components()


@app.get("/api/data-quality")
async def get_data_quality():
    """9. Data Quality Metrics & Score (94.7/100)."""
    return engine.get_data_quality()


@app.get("/api/sources-status")
async def get_sources_status():
    """10. Scraping Source Monitoring & Status."""
    return engine.get_sources_status()


@app.get("/api/validation-30day")
async def get_validation_30day():
    """11. 30-Day ARI Methodological Validation."""
    return engine.get_validation_30day()


@app.get("/api/dgca-comparison")
async def get_dgca_comparison():
    """12. AIRFLEX ARI vs DGCA Benchmark comparison."""
    return engine.get_dgca_comparison()


@app.get("/api/early-warning")
async def get_early_warning():
    """13. Airfare Surge Early Warning Signals."""
    return engine.get_early_warning_signals()


@app.get("/api/observations")
async def get_observations(
    search: str = Query("", description="Search observation ID, flight number, source"),
    route: str = Query("ALL", description="Filter by route pair"),
    airline: str = Query("ALL", description="Filter by airline"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500)
):
    """14. Filterable Raw Observations Explorer."""
    return engine.get_raw_observations(search=search, route=route, airline=airline, page=page, limit=limit)


@app.get("/api/traceability/{observation_id}")
async def trace_observation(observation_id: str):
    """15. Step-by-step Audit Trail Traceability for an observation."""
    return engine.trace_observation(observation_id)
