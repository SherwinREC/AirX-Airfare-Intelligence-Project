"""AIRX backend API regression suite (dataset-derived analytics endpoints)."""
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root / health ----------
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "OPERATIONAL"
        assert d["apix"] == 100.43
        assert d["valid_observations"] == 98722


# ---------- Overview ----------
class TestOverview:
    def test_overview_kpis(self, api):
        r = api.get(f"{BASE_URL}/api/overview", timeout=60)
        assert r.status_code == 200
        d = r.json()
        k = d["kpis"]
        assert k["apix"] == 100.43
        assert k["apix_change_pct"] == 0.43
        assert k["valid_observations"] == 98722
        assert k["total_observations"] == 98757
        assert k["routes_tracked"] == 36
        assert k["airlines_tracked"] == 5
        assert round(k["validity_rate"], 3) == 99.965
        assert k["avg_fare"] == 5642
        assert "drivers" in d and isinstance(d["drivers"], dict)
        assert d["cpi"]["cpi_contribution_pp"] == 0.00033
        assert isinstance(d["airports"], dict) and len(d["airports"]) > 5
        assert "_id" not in str(d)


# ---------- Index series ----------
class TestIndexSeries:
    @pytest.mark.parametrize("tf", ["7D", "30D", "3M", "6M", "1Y"])
    def test_timeframes(self, api, tf):
        r = api.get(f"{BASE_URL}/api/index-series", params={"timeframe": tf, "aggregation": "daily"}, timeout=60)
        assert r.status_code == 200
        d = r.json()
        series = d["series"] if isinstance(d, dict) else d
        assert len(series) > 0
        pt = series[0]
        assert "apix" in pt or "index" in pt
        assert "dgca_benchmark" in pt

    def test_weekly_aggregation(self, api):
        r = api.get(f"{BASE_URL}/api/index-series", params={"timeframe": "30D", "aggregation": "weekly"}, timeout=60)
        assert r.status_code == 200
        d = r.json()
        series = d["series"] if isinstance(d, dict) else d
        assert len(series) > 0


# ---------- Routes ----------
class TestRoutes:
    def test_routes_list(self, api):
        r = api.get(f"{BASE_URL}/api/routes", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert d["count"] == 36
        assert len(d["routes"]) == 36
        assert d["routes"][0]["avg_fare"] > 0

    def test_route_details(self, api):
        r = api.get(f"{BASE_URL}/api/routes/DEL/BOM", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert d.get("origin") == "DEL"
        assert d.get("destination") == "BOM"

    def test_route_not_found(self, api):
        r = api.get(f"{BASE_URL}/api/routes/XXX/YYY", timeout=60)
        assert r.status_code == 404
        assert "detail" in r.json()


# ---------- Lead time / airlines / components ----------
class TestAnalytics:
    def test_lead_time(self, api):
        r = api.get(f"{BASE_URL}/api/lead-time", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert "windows" in d and len(d["windows"]) > 0
        assert "elasticity_overall" in d

    def test_airlines(self, api):
        r = api.get(f"{BASE_URL}/api/airlines", timeout=60)
        assert r.status_code == 200
        d = r.json()
        arr = d["airlines"] if isinstance(d, dict) and "airlines" in d else d
        assert len(arr) == 5

    def test_fare_components(self, api):
        r = api.get(f"{BASE_URL}/api/fare-components", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, dict) and len(d) > 0

    def test_alerts(self, api):
        r = api.get(f"{BASE_URL}/api/alerts", timeout=60)
        assert r.status_code == 200
        d = r.json()
        arr = d["alerts"] if isinstance(d, dict) and "alerts" in d else d
        assert isinstance(arr, list)


# ---------- Data quality & validation ----------
class TestQuality:
    def test_data_quality(self, api):
        r = api.get(f"{BASE_URL}/api/data-quality", timeout=60)
        assert r.status_code == 200
        d = r.json()
        rate = d.get("validity_rate", d.get("validity_pct"))
        assert round(rate, 3) == 99.965
        assert d["total_observations"] == 98757
        assert d["valid_observations"] == 98722

    def test_v1_data_quality(self, api):
        r = api.get(f"{BASE_URL}/api/v1/data-quality", timeout=60)
        assert r.status_code == 200
        d = r.json()
        rate = d.get("validity_rate", d.get("validity_pct"))
        assert round(rate, 3) == 99.965

    def test_validation(self, api):
        r = api.get(f"{BASE_URL}/api/validation", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, dict) and len(d) > 0


# ---------- CPI sensitivity + simulator ----------
class TestCpi:
    def test_cpi_default(self, api):
        r = api.get(f"{BASE_URL}/api/cpi-sensitivity", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert d["cpi_contribution_pp"] == 0.00033
        assert round(d["airfare_cpi_weight_pct"], 5) == 0.07722

    def test_simulate_changes_output(self, api):
        base = api.get(f"{BASE_URL}/api/cpi-sensitivity", timeout=60).json()
        r = api.post(f"{BASE_URL}/api/cpi-sensitivity/simulate",
                     json={"multiplier": 2.5, "fuel_shock_pct": 20.0}, timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert d["cpi_contribution_pp"] != base["cpi_contribution_pp"], "Simulation did not change CPI contribution"
        assert d["cpi_contribution_pp"] > base["cpi_contribution_pp"]

    def test_simulate_defaults_match_get(self, api):
        base = api.get(f"{BASE_URL}/api/cpi-sensitivity", timeout=60).json()
        d = api.post(f"{BASE_URL}/api/cpi-sensitivity/simulate", json={}, timeout=60).json()
        assert d["cpi_contribution_pp"] == base["cpi_contribution_pp"]

    def test_v1_cpi(self, api):
        r = api.get(f"{BASE_URL}/api/v1/cpi-sensitivity", timeout=60)
        assert r.status_code == 200
        assert r.json()["cpi_contribution_pp"] == 0.00033


# ---------- Raw data pagination & filters ----------
class TestRawData:
    def test_pagination(self, api):
        p1 = api.get(f"{BASE_URL}/api/raw-data", params={"page": 1, "page_size": 25}, timeout=60)
        assert p1.status_code == 200
        d1 = p1.json()
        assert len(d1["data"] if "data" in d1 else d1["observations"]) == 25
        p2 = api.get(f"{BASE_URL}/api/raw-data", params={"page": 2, "page_size": 25}, timeout=60).json()
        rows1 = d1.get("data") or d1.get("observations")
        rows2 = p2.get("data") or p2.get("observations")
        assert rows1[0] != rows2[0], "Page 2 returned same first row as page 1"
        assert not any("_id" in k for row in rows1 for k in row if k != "observation_id")

    def test_invalid_page(self, api):
        r = api.get(f"{BASE_URL}/api/raw-data", params={"page": 0}, timeout=60)
        assert r.status_code == 422

    def test_filter_airline(self, api):
        r = api.get(f"{BASE_URL}/api/raw-data", params={"page": 1, "page_size": 10, "airline": "IndiGo"}, timeout=60)
        assert r.status_code == 200
        rows = r.json().get("data") or r.json().get("observations")
        assert all("indigo" in str(row).lower() for row in rows) or len(rows) == 0

    def test_fare_range_filter(self, api):
        r = api.get(f"{BASE_URL}/api/raw-data",
                    params={"page": 1, "page_size": 10, "min_fare": 3000, "max_fare": 5000}, timeout=60)
        assert r.status_code == 200


# ---------- Pipeline & AI ----------
class TestPipelineAi:
    def test_trigger_scrape(self, api):
        r = api.post(f"{BASE_URL}/api/pipeline/trigger-scrape", timeout=120)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, dict) and len(d) > 0

    def test_ai_deterministic(self, api):
        r = api.post(f"{BASE_URL}/api/ai/explain",
                     json={"query_type": "market_overview", "deterministic_only": True}, timeout=120)
        assert r.status_code == 200
        d = r.json()
        assert d["mode"].startswith("deterministic")
        assert len(d["summary"]) > 20

    def test_ai_live(self, api):
        r = api.post(f"{BASE_URL}/api/ai/explain",
                     json={"query_type": "market_overview", "provider": "openai"}, timeout=180)
        assert r.status_code == 200
        d = r.json()
        assert d["mode"] in ("ai_enhanced_intelligence", "deterministic_statistical_engine", "deterministic_fallback")
        assert len(d["summary"]) > 20


# ---------- v1 misc ----------
class TestV1:
    def test_v1_fares(self, api):
        r = api.get(f"{BASE_URL}/api/v1/fares", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert d["national_average_fare_inr"] == 5642
