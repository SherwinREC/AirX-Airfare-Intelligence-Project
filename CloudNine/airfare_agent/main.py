"""
One-Click Main Entry Point for Airfare Data Collection Agent
Usage:
    python main.py             # Run single-click scraping pipeline
    python main.py --server    # Launch REST API & Web Dashboard
"""

import sys
import asyncio
import argparse
import logging
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from agent.orchestrator import AirfareAgentOrchestrator

# Ensure logs directory exists
logs_dir = Path(__file__).parent / "logs"
logs_dir.mkdir(parents=True, exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(logs_dir / "agent.log", encoding="utf-8")
    ]
)


def run_pipeline():
    """Execute single-click scraping workflow."""
    orchestrator = AirfareAgentOrchestrator()
    summary = asyncio.run(orchestrator.execute_run())

    print("\n" + "=" * 50)
    print("  AIRFARE DATA COLLECTION SUMMARY")
    print("=" * 50)
    print(f"  Run ID            : {summary.run_id}")
    print(f"  Status            : {summary.status.value}")
    print(f"  Sources Attempted : {summary.sources_attempted}")
    print(f"  Sources Successful: {summary.sources_successful}")
    print(f"  Records Scraped   : {summary.records_scraped}")
    print(f"  Records Valid     : {summary.records_valid}")
    print(f"  Records Inserted  : {summary.records_inserted} (New observations)")
    print(f"  Duplicates Skipped: {summary.records_duplicate}")
    print(f"  Master CSV Output : ./data/airfare_master.csv")
    print("=" * 50 + "\n")


def start_server():
    """Launch FastAPI Uvicorn Web Server."""
    import uvicorn
    print("Starting Airfare Collection Agent REST API & Dashboard on http://localhost:8000 ...")
    uvicorn.run("api.routes:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Airfare Data Collection Agent")
    parser.add_argument("--server", action="store_true", help="Start FastAPI web server and dashboard")
    args = parser.parse_args()

    if args.server:
        start_server()
    else:
        run_pipeline()
