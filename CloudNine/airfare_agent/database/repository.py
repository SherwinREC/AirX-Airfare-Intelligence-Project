"""
Data Access Repository for Airfare Data & Execution Metrics
"""

import json
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.database import (
    AirfareObservationModel, ScrapeRunModel, ScrapeErrorModel, SourceModel
)
from models.airfare import AirfareObservation, ScrapeStatusEnum


class AirfareRepository:
    def __init__(self, db: Session):
        self.db = db

    def exists_observation(self, observation_id: str) -> bool:
        """Check if an observation with the exact fingerprint hash already exists."""
        return self.db.query(AirfareObservationModel).filter(
            AirfareObservationModel.observation_id == observation_id
        ).first() is not None

    def insert_observations(self, observations: List[AirfareObservation]) -> tuple[int, int]:
        """
        Inserts valid observations into DB.
        Returns: (inserted_count, duplicate_count)
        Does NOT overwrite valid historical observations.
        """
        inserted = 0
        duplicates = 0

        for obs in observations:
            if self.exists_observation(obs.observation_id):
                duplicates += 1
                continue

            # Convert datetime string to datetime object
            scraped_dt = datetime.fromisoformat(obs.scraped_at)

            model = AirfareObservationModel(
                observation_id=obs.observation_id,
                source_name=obs.source_name,
                source_type=obs.source_type,
                airline=obs.airline,
                flight_number=obs.flight_number,
                origin=obs.origin,
                destination=obs.destination,
                travel_date=obs.travel_date,
                departure_time=obs.departure_time,
                arrival_time=obs.arrival_time,
                duration_minutes=obs.duration_minutes,
                stops=obs.stops,
                cabin_class=obs.cabin_class,
                fare_type=obs.fare_type,
                base_fare=obs.base_fare,
                taxes=obs.taxes,
                fees=obs.fees,
                total_fare=obs.total_fare,
                currency=obs.currency,
                baggage_information=obs.baggage_information,
                aircraft_type=obs.aircraft_type,
                seat_availability=obs.seat_availability,
                booking_url=obs.booking_url,
                scraped_at=scraped_dt,
                scraper_version=obs.scraper_version
            )
            self.db.add(model)
            inserted += 1

        self.db.commit()
        return inserted, duplicates

    def create_scrape_run(self, run_id: str, started_at: datetime) -> ScrapeRunModel:
        """Create a new scrape run entry."""
        run = ScrapeRunModel(
            run_id=run_id,
            started_at=started_at,
            status=ScrapeStatusEnum.RUNNING.value
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def update_scrape_run(
        self,
        run_id: str,
        status: ScrapeStatusEnum,
        completed_at: datetime,
        sources_attempted: int,
        sources_successful: int,
        sources_failed: int,
        records_scraped: int,
        records_valid: int,
        records_inserted: int,
        records_duplicate: int,
        errors: List[str]
    ) -> ScrapeRunModel:
        """Update scrape run status and metrics."""
        run = self.db.query(ScrapeRunModel).filter(ScrapeRunModel.run_id == run_id).first()
        if run:
            run.status = status.value
            run.completed_at = completed_at
            run.sources_attempted = sources_attempted
            run.sources_successful = sources_successful
            run.sources_failed = sources_failed
            run.records_scraped = records_scraped
            run.records_valid = records_valid
            run.records_inserted = records_inserted
            run.records_duplicate = records_duplicate
            run.errors_json = json.dumps(errors)
            self.db.commit()
            self.db.refresh(run)
        return run

    def record_scrape_error(self, run_id: str, source_name: str, error_type: str, error_message: str):
        """Log a source scrape failure."""
        err = ScrapeErrorModel(
            run_id=run_id,
            source_name=source_name,
            error_type=error_type,
            error_message=error_message,
            occurred_at=datetime.now(timezone.utc)
        )
        self.db.add(err)
        self.db.commit()

    def export_master_datasets(self, csv_path: str, parquet_path: Optional[str] = None) -> int:
        """
        Regenerates master CSV and Parquet datasets directly from DB source of truth.
        Returns total rows exported.
        """
        query = self.db.query(AirfareObservationModel).order_by(AirfareObservationModel.scraped_at.desc())
        df = pd.read_sql(query.statement, self.db.bind)

        if df.empty:
            # Export empty CSV with clean headers
            headers_df = pd.DataFrame(columns=[
                "observation_id", "source_name", "source_type", "airline", "flight_number",
                "origin", "destination", "travel_date", "departure_time", "arrival_time",
                "duration_minutes", "stops", "cabin_class", "fare_type", "base_fare",
                "taxes", "fees", "total_fare", "currency", "baggage_information",
                "aircraft_type", "seat_availability", "booking_url", "scraped_at", "scraper_version"
            ])
            headers_df.to_csv(csv_path, index=False)
            return 0

        # Drop surrogate DB primary key 'id' to ensure schema alignment
        if "id" in df.columns:
            df = df.drop(columns=["id"])

        # Cleanly format dates so Excel displays them without ###### column width issues
        if "travel_date" in df.columns:
            df["travel_date"] = pd.to_datetime(df["travel_date"]).dt.strftime("%Y-%m-%d")

        if "scraped_at" in df.columns:
            df["scraped_at"] = pd.to_datetime(df["scraped_at"]).dt.strftime("%Y-%m-%d %H:%M:%S")

        # Write CSV with Excel lock protection fallback
        try:
            df.to_csv(csv_path, index=False)
        except PermissionError:
            fallback_csv = str(Path(csv_path).parent / "airfare_master_latest.csv")
            df.to_csv(fallback_csv, index=False)
            print(f"\n[NOTICE] '{csv_path}' is currently open/locked by Excel.")
            print(f"         Exported latest dataset to '{fallback_csv}' instead.\n")

        # Write Parquet if path provided
        if parquet_path:
            try:
                df.to_parquet(parquet_path, index=False)
            except Exception:
                pass  # Parquet export is optional fallback

        return len(df)

    def get_recent_observations(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch latest airfare observations for REST API & UI."""
        records = self.db.query(AirfareObservationModel)\
            .order_by(AirfareObservationModel.scraped_at.desc())\
            .limit(limit).all()

        return [
            {
                "observation_id": r.observation_id,
                "source_name": r.source_name,
                "source_type": r.source_type,
                "airline": r.airline,
                "flight_number": r.flight_number,
                "origin": r.origin,
                "destination": r.destination,
                "travel_date": r.travel_date,
                "departure_time": r.departure_time,
                "arrival_time": r.arrival_time,
                "duration_minutes": r.duration_minutes,
                "stops": r.stops,
                "cabin_class": r.cabin_class,
                "fare_type": r.fare_type,
                "total_fare": r.total_fare,
                "currency": r.currency,
                "scraped_at": r.scraped_at.isoformat() if r.scraped_at else ""
            }
            for r in records
        ]

    def get_statistics(self) -> Dict[str, Any]:
        """Aggregate stats for dashboard & API."""
        total_obs = self.db.query(func.count(AirfareObservationModel.id)).scalar() or 0
        total_runs = self.db.query(func.count(ScrapeRunModel.id)).scalar() or 0
        avg_fare = self.db.query(func.avg(AirfareObservationModel.total_fare)).scalar() or 0.0
        min_fare = self.db.query(func.min(AirfareObservationModel.total_fare)).scalar() or 0.0
        max_fare = self.db.query(func.max(AirfareObservationModel.total_fare)).scalar() or 0.0

        # Unique airlines & routes
        airlines_count = self.db.query(func.count(func.distinct(AirfareObservationModel.airline))).scalar() or 0
        routes_count = self.db.query(
            func.count(func.distinct(AirfareObservationModel.origin + "-" + AirfareObservationModel.destination))
        ).scalar() or 0

        return {
            "total_observations": total_obs,
            "total_scrape_runs": total_runs,
            "average_fare": round(float(avg_fare), 2),
            "min_fare": round(float(min_fare), 2),
            "max_fare": round(float(max_fare), 2),
            "airlines_tracked": airlines_count,
            "routes_tracked": routes_count
        }
