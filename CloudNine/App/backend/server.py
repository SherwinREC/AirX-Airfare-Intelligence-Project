from fastapi import FastAPI, APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import asyncio
import logging
import subprocess
import threading
import sys
import time
from pathlib import Path

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from analytics_engine import analytics_engine, AIRPORT_META
from auth import build_auth_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

app = FastAPI(
    title="AIRX — Real-Time Indian Airfare Price Intelligence & CPI Platform",
    description="Government-grade statistical intelligence system for NSO, RBI, and Ministry of Civil Aviation (MoCA)",
    version="1.0.0"
)

api_router = APIRouter(prefix="/api")
v1_router = APIRouter(prefix="/api/v1")


class AiExplainRequest(BaseModel):
    model: Optional[str] = "gpt-5.4"
    provider: Optional[str] = "openai"
    query_type: Optional[str] = "market_overview"
    route: Optional[str] = None
    context_data: Optional[Dict[str, Any]] = None
    deterministic_only: Optional[bool] = False


class CpiSimulateRequest(BaseModel):
    multiplier: Optional[float] = 1.0
    fuel_shock_pct: Optional[float] = 0.0


@api_router.get("/")
async def root():
    return {
        "system": "AIRX Real-Time Indian Airfare Intelligence Dashboard",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "apix": analytics_engine.apix_current,
        "apix_change": f"+{analytics_engine.apix_change}%",
        "valid_observations": analytics_engine.valid_observations,
        "docs": "/docs"
    }


@api_router.get("/overview")
async def get_overview():
    kpis = analytics_engine.get_overview_kpis()
    drivers = analytics_engine.get_market_drivers()
    cpi = analytics_engine.get_cpi_sensitivity()
    return {
        "kpis": kpis,
        "drivers": drivers,
        "cpi": cpi,
        "airports": AIRPORT_META
    }


@api_router.get("/index-series")
async def get_index_series(timeframe: str = "30D", aggregation: str = "daily"):
    return analytics_engine.get_index_series(timeframe=timeframe, aggregation=aggregation)


@api_router.get("/routes")
async def get_routes():
    routes = analytics_engine.get_all_routes()
    return {
        "count": len(routes),
        "routes": routes
    }


@api_router.get("/routes/{origin}/{destination}")
async def get_route_details(origin: str, destination: str):
    details = analytics_engine.get_route_details(origin, destination)
    if not details:
        raise HTTPException(status_code=404, detail=f"Route {origin}-{destination} not found in monitored basket")
    return details


@api_router.get("/lead-time")
async def get_lead_time():
    return analytics_engine.get_lead_time_analysis()


@api_router.get("/airlines")
async def get_airlines():
    return analytics_engine.get_airlines()


@api_router.get("/fare-components")
async def get_fare_components():
    return analytics_engine.get_fare_components()


@api_router.get("/data-quality")
async def get_data_quality():
    return analytics_engine.get_data_quality()


@api_router.get("/validation")
async def get_validation():
    return analytics_engine.get_validation_backtest()


@api_router.get("/cpi-sensitivity")
async def get_cpi_sensitivity(multiplier: float = 1.0, fuel_shock: float = 0.0):
    return analytics_engine.get_cpi_sensitivity(custom_multiplier=multiplier, fuel_shock_pct=fuel_shock)


@api_router.post("/cpi-sensitivity/simulate")
async def simulate_cpi(payload: CpiSimulateRequest):
    return analytics_engine.get_cpi_sensitivity(custom_multiplier=payload.multiplier, fuel_shock_pct=payload.fuel_shock_pct)


@api_router.get("/alerts")
async def get_alerts():
    return analytics_engine.get_alerts()


@api_router.get("/raw-data")
async def get_raw_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    route: Optional[str] = Query(None),
    airline: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    min_fare: Optional[float] = Query(None),
    max_fare: Optional[float] = Query(None)
):
    return analytics_engine.get_raw_observations(
        page=page,
        page_size=page_size,
        route=route,
        airline=airline,
        source=source,
        min_fare=min_fare,
        max_fare=max_fare
    )


# Scraper Process Controller State
scraper_state = {
    "is_running": False,
    "status": "idle",  # idle, running, completed, failed
    "start_time": None,
    "end_time": None,
    "duration_sec": 0,
    "logs": [],
    "exit_code": None
}
scraper_lock = threading.Lock()


def _run_airfare_scraper_worker():
    global scraper_state
    agent_dir = Path(__file__).parent.parent.parent / "airfare_agent"

    python_exe = sys.executable or "python"

    with scraper_lock:
        scraper_state["is_running"] = True
        scraper_state["status"] = "running"
        scraper_state["start_time"] = datetime.now(timezone.utc).isoformat()
        scraper_state["end_time"] = None
        scraper_state["duration_sec"] = 0
        scraper_state["logs"] = [
            f"[{datetime.now().strftime('%H:%M:%S')}] Launching live scraper agent (python main.py)...",
            f"[{datetime.now().strftime('%H:%M:%S')}] Target directory: {agent_dir}"
        ]
        scraper_state["exit_code"] = None

    start_ts = time.time()
    try:
        proc = subprocess.Popen(
            [python_exe, "main.py"],
            cwd=str(agent_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        for line in iter(proc.stdout.readline, ''):
            if line:
                clean_line = line.strip()
                if clean_line:
                    with scraper_lock:
                        scraper_state["logs"].append(f"[{datetime.now().strftime('%H:%M:%S')}] {clean_line}")
                        scraper_state["duration_sec"] = round(time.time() - start_ts, 1)

        proc.stdout.close()
        return_code = proc.wait()

        with scraper_lock:
            scraper_state["exit_code"] = return_code
            scraper_state["end_time"] = datetime.now(timezone.utc).isoformat()
            scraper_state["duration_sec"] = round(time.time() - start_ts, 1)
            if return_code == 0:
                scraper_state["status"] = "completed"
                scraper_state["logs"].append(f"[{datetime.now().strftime('%H:%M:%S')}] [SUCCESS] Live scraping cycle finished in {scraper_state['duration_sec']}s.")
            else:
                scraper_state["status"] = "failed"
                scraper_state["logs"].append(f"[{datetime.now().strftime('%H:%M:%S')}] [ERROR] Process exited with code {return_code}")
    except Exception as e:
        with scraper_lock:
            scraper_state["status"] = "failed"
            scraper_state["end_time"] = datetime.now(timezone.utc).isoformat()
            scraper_state["duration_sec"] = round(time.time() - start_ts, 1)
            scraper_state["logs"].append(f"[{datetime.now().strftime('%H:%M:%S')}] [EXCEPTION] Failed to run scraper: {str(e)}")
    finally:
        with scraper_lock:
            scraper_state["is_running"] = False
        analytics_engine.reload_data()


@api_router.post("/scraper/start")
@api_router.post("/pipeline/trigger-scrape")
async def trigger_scraper():
    with scraper_lock:
        if scraper_state["is_running"]:
            return {
                "status": "ALREADY_RUNNING",
                "message": "Scraper pipeline is already executing.",
                "scraper_state": scraper_state
            }

    thread = threading.Thread(target=_run_airfare_scraper_worker, daemon=True)
    thread.start()
    return {
        "status": "STARTED",
        "message": "Live airfare scraping pipeline initiated successfully.",
        "scraper_state": scraper_state
    }


@api_router.get("/scraper/status")
async def get_scraper_status():
    with scraper_lock:
        return {
            "is_running": scraper_state["is_running"],
            "status": scraper_state["status"],
            "start_time": scraper_state["start_time"],
            "end_time": scraper_state["end_time"],
            "duration_sec": scraper_state["duration_sec"],
            "total_logs": len(scraper_state["logs"]),
            "logs": scraper_state["logs"],
            "exit_code": scraper_state["exit_code"]
        }



@api_router.post("/ai/explain")
async def explain_movement(req: AiExplainRequest):
    emergent_key = os.environ.get("EMERGENT_LLM_KEY", "")
    drivers_data = analytics_engine.get_market_drivers()
    
    if req.deterministic_only or not emergent_key or emergent_key.startswith("mock"):
        return {
            "mode": "deterministic_statistical_engine",
            "summary": drivers_data["deterministic_summary"],
            "factors": drivers_data["drivers"],
            "cpi_transmission": "Airfare inflation passed +0.00033 percentage points to headline CPI sensitivity baseline.",
            "policy_recommendation": "Maintain standard periodic oversight; price spikes remain contained to high-density business sectors without structural capacity deficits."
        }

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        system_prompt = (
            "You are the Senior Chief Economist and Aviation Intelligence Analyst for AIRX, "
            "an official government-grade data analytics platform serving the National Statistical Office (NSO), "
            "the Reserve Bank of India (RBI), and the Ministry of Civil Aviation. "
            "Your answers must be concise, mathematically sound, highly professional, and devoid of marketing fluff. "
            "Explain why the Airfare Price Index (APIx = 100.43, +0.43%) moved, quoting exact data points."
        )
        
        prompt_text = (
            f"Explain the latest Indian Airfare Price Index movement (APIx = 100.43, +0.43% from base 100.00). "
            f"Key metrics: 36 routes monitored, 98,722 valid observations across 5 airlines (Air India, IndiGo, Vistara, SpiceJet, Fly91). "
            f"Top drivers: DEL-BOM (+0.16% contribution), BLR-MAA (+0.12% contribution), T+1 short lead time elasticity (+0.08%). "
            f"CPI Sensitivity contribution: +0.00033 percentage points (airfare basket weight 0.07722%). "
            f"Query context: {req.query_type}. Provide a concise 3-paragraph executive summary: 1. Core Drivers, 2. Route & Booking Dynamics, 3. CPI & Policy Implication."
        )
        
        provider = req.provider or "openai"
        model_name = "gpt-5.4" if provider == "openai" else "gemini-3-flash-preview"
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"airx-ai-{uuid.uuid4().hex[:8]}",
            system_message=system_prompt
        ).with_model(provider, model_name)
        
        response = await chat.send_message(UserMessage(text=prompt_text))
        
        return {
            "mode": "ai_enhanced_intelligence",
            "provider": provider,
            "model": model_name,
            "summary": response.content if hasattr(response, 'content') else str(response),
            "factors": drivers_data["drivers"],
            "cpi_contribution_pp": 0.00033
        }
    except Exception as e:
        logging.getLogger("airx").warning(f"AI explanation call fell back to deterministic engine: {e}")
        return {
            "mode": "deterministic_fallback",
            "summary": drivers_data["deterministic_summary"],
            "factors": drivers_data["drivers"],
            "cpi_transmission": "Airfare inflation passed +0.00033 percentage points to headline CPI sensitivity baseline."
        }


@v1_router.get("/airfare-index")
async def v1_airfare_index():
    return {
        "date": "2026-08-27",
        "index": analytics_engine.apix_current,
        "change": analytics_engine.apix_change,
        "base_period": "2026-08-25 = 100.00",
        "sample_size": analytics_engine.valid_observations,
        "confidence": "HIGH"
    }


@v1_router.get("/routes")
async def v1_routes():
    return {
        "total_routes": len(analytics_engine.routes_cache),
        "data": analytics_engine.get_all_routes()
    }


@v1_router.get("/fares")
async def v1_fares():
    return {
        "national_average_fare_inr": 5642,
        "national_median_fare_inr": 5021,
        "components": analytics_engine.get_fare_components()
    }


@v1_router.get("/data-quality")
async def v1_data_quality():
    return analytics_engine.get_data_quality()


@v1_router.get("/cpi-sensitivity")
async def v1_cpi_sensitivity():
    return analytics_engine.get_cpi_sensitivity()


app.include_router(api_router)
app.include_router(v1_router)
app.include_router(build_auth_router(db))

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)