"""
Airfare Collection Agent Orchestrator
Coordinates configuration loading, source health checks, parallel/sequential scraping,
data normalization, validation, deduplication, database persistence, and master CSV exports.
"""

import os
import yaml
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional

from models.airfare import SearchParams, AirfareObservation, ScrapeRunSummary, ScrapeStatusEnum
from processing.validator import AirfareValidator
from processing.deduplicator import AirfareDeduplicator
from database.connection import init_db, SessionLocal
from database.repository import AirfareRepository

from scrapers.easemytrip_scraper import EaseMyTripScraper
from scrapers.ixigo_scraper import IxigoScraper
from scrapers.google_flights_scraper import GoogleFlightsScraper
from scrapers.mock_scraper import MockScraper

logger = logging.getLogger("airfare_agent")


class AirfareAgentOrchestrator:
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent
        self.sources_config_path = self.base_dir / "config" / "sources.yaml"
        self.routes_config_path = self.base_dir / "config" / "routes.yaml"
        self.master_csv_path = self.base_dir / "data" / "airfare_master.csv"
        self.master_parquet_path = self.base_dir / "data" / "airfare_master.parquet"

        # Ensure directories exist
        (self.base_dir / "data").mkdir(parents=True, exist_ok=True)
        (self.base_dir / "logs").mkdir(parents=True, exist_ok=True)

        # Initialize Database tables
        init_db()

    def load_sources_config(self) -> List[Dict[str, Any]]:
        """Load sources.yaml configuration."""
        if not self.sources_config_path.exists():
            logger.warning(f"sources.yaml not found at {self.sources_config_path}. Using default.")
            return [{"name": "mock_airline", "enabled": True, "type": "airline"}]

        with open(self.sources_config_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            return data.get("sources", [])

    def load_routes_config(self) -> List[Dict[str, Any]]:
        """Load routes.yaml configuration."""
        if not self.routes_config_path.exists():
            logger.warning(f"routes.yaml not found at {self.routes_config_path}. Using default.")
            return [{"origin": "MAA", "destination": "DEL", "cabin_class": "Economy", "days_ahead": 7}]

        with open(self.routes_config_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            return data.get("routes", [])

    def get_scraper_instance(self, source_name: str, headless: bool = True):
        """Instantiate target scraper by name."""
        name = source_name.lower().strip()
        if name == "easemytrip":
            return EaseMyTripScraper(headless=headless)
        elif name == "ixigo":
            return IxigoScraper(headless=headless)
        elif name == "google_flights":
            return GoogleFlightsScraper(headless=headless)
        elif name == "mock_airline":
            return MockScraper(headless=headless)
        else:
            raise ValueError(f"Unknown scraper source name: '{source_name}'")

    async def execute_run(self) -> ScrapeRunSummary:
        """
        Main pipeline execution entry point.
        """
        started_at_dt = datetime.now(timezone.utc)
        run_id = f"RUN_{started_at_dt.strftime('%Y%m%d_%H%M%S')}"

        logger.info(f"========================================")
        logger.info(f"AIRFARE DATA COLLECTION AGENT")
        logger.info(f"Run ID: {run_id}")
        logger.info(f"========================================")

        db = SessionLocal()
        repo = AirfareRepository(db)

        # Create Scrape Run Record in DB
        db_run = repo.create_scrape_run(run_id, started_at_dt)

        sources_cfg = self.load_sources_config()
        routes_cfg = self.load_routes_config()

        enabled_sources = [s for s in sources_cfg if s.get("enabled", True)]

        sources_attempted = len(enabled_sources)
        sources_successful = 0
        sources_failed = 0
        total_scraped = 0
        total_valid = 0
        total_inserted = 0
        total_duplicate = 0
        errors_list = []

        logger.info(f"[1/5] Checking enabled sources ({sources_attempted})...")

        for source_cfg in enabled_sources:
            source_name = source_cfg.get("name")
            headless = source_cfg.get("headless", True)

            try:
                scraper = self.get_scraper_instance(source_name, headless=headless)
                logger.info(f"[OK] Source '{source_name}' initialized")

                source_valid_obs: List[AirfareObservation] = []

                # Scrape for each route configured across the continuous 7-day window (Today to Today + 6)
                seen_route_keys = set()
                for route in routes_cfg:
                    origin = route.get("origin", "MAA")
                    destination = route.get("destination", "DEL")
                    cabin = route.get("cabin_class", "Economy")
                    route_key = f"{origin}-{destination}-{cabin}"

                    if route_key in seen_route_keys:
                        continue
                    seen_route_keys.add(route_key)

                    # Scan continuous 7 days starting from today (Day 0 to Day 6)
                    num_days = int(route.get("scrape_window_days", 7))
                    for day_offset in range(num_days):
                        target_date = (datetime.now() + timedelta(days=day_offset)).strftime("%Y-%m-%d")

                        search_params = SearchParams(
                            origin=origin,
                            destination=destination,
                            travel_date=target_date,
                            cabin_class=cabin
                        )

                        logger.info(f"   Searching {source_name} for route {search_params.origin}->{search_params.destination} on {search_params.travel_date} (Day {day_offset+1}/{num_days})...")

                        raw_records = await scraper.search_flights(search_params)
                        total_scraped += len(raw_records)

                        # Normalize
                        normalized_obs = scraper.normalize(raw_records, search_params)

                        # Validate
                        for obs in normalized_obs:
                            is_valid, validation_errs = AirfareValidator.validate_observation(obs)
                            if is_valid:
                                source_valid_obs.append(obs)
                                total_valid += 1
                            else:
                                err_msg = f"[{source_name}] Validation failed for {obs.flight_number}: {', '.join(validation_errs)}"
                                errors_list.append(err_msg)
                                logger.warning(err_msg)

                # In-memory batch deduplication for this source
                unique_source_obs = AirfareDeduplicator.deduplicate_batch(source_valid_obs)

                # Persist into DB repository (preserves valid history, skips exact duplicates)
                inserted, duplicates = repo.insert_observations(unique_source_obs)
                total_inserted += inserted
                total_duplicate += (len(source_valid_obs) - len(unique_source_obs)) + duplicates

                sources_successful += 1
                logger.info(f"[OK] Source '{source_name}': {len(source_valid_obs)} valid, {inserted} new inserted, {duplicates} duplicates skipped")

            except Exception as e:
                sources_failed += 1
                err_msg = f"Source '{source_name}' failed: {str(e)}"
                errors_list.append(err_msg)
                logger.error(f"[FAIL] {err_msg}")
                repo.record_scrape_error(run_id, source_name, type(e).__name__, str(e))

        # Determine final status
        if sources_successful == sources_attempted:
            final_status = ScrapeStatusEnum.SUCCESS
        elif sources_successful > 0:
            final_status = ScrapeStatusEnum.PARTIAL_SUCCESS
        else:
            final_status = ScrapeStatusEnum.FAILED

        completed_at_dt = datetime.now(timezone.utc)

        # Update Scrape Run status in DB
        repo.update_scrape_run(
            run_id=run_id,
            status=final_status,
            completed_at=completed_at_dt,
            sources_attempted=sources_attempted,
            sources_successful=sources_successful,
            sources_failed=sources_failed,
            records_scraped=total_scraped,
            records_valid=total_valid,
            records_inserted=total_inserted,
            records_duplicate=total_duplicate,
            errors=errors_list
        )

        logger.info(f"[5/5] Regenerating master dataset from database...")
        exported_count = repo.export_master_datasets(
            csv_path=str(self.master_csv_path),
            parquet_path=str(self.master_parquet_path)
        )
        logger.info(f"[OK] Master dataset updated: '{self.master_csv_path}' ({exported_count} total historical records)")

        db.close()

        summary = ScrapeRunSummary(
            run_id=run_id,
            started_at=started_at_dt.isoformat(),
            completed_at=completed_at_dt.isoformat(),
            status=final_status,
            sources_attempted=sources_attempted,
            sources_successful=sources_successful,
            sources_failed=sources_failed,
            records_scraped=total_scraped,
            records_valid=total_valid,
            records_inserted=total_inserted,
            records_duplicate=total_duplicate,
            errors=errors_list
        )

        logger.info(f"========================================")
        logger.info(f"RUN COMPLETE - Status: {final_status.value}")
        logger.info(f"========================================\n")

        return summary
