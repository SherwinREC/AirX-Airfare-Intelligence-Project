"""
SQLAlchemy ORM Models for Airfare System (Expanded Schema)
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, Boolean, Index
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class SourceModel(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    enabled = Column(Boolean, default=True)
    type = Column(String(20), default="ota")
    last_run_at = Column(DateTime, nullable=True)
    health_status = Column(String(20), default="HEALTHY")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AirfareObservationModel(Base):
    __tablename__ = "airfare_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    observation_id = Column(String(64), unique=True, nullable=False, index=True)
    source_name = Column(String(50), nullable=False, index=True)
    source_type = Column(String(20), nullable=False, default="ota")
    airline = Column(String(50), nullable=False, index=True)
    flight_number = Column(String(30), nullable=False, index=True)
    origin = Column(String(10), nullable=False, index=True)
    destination = Column(String(10), nullable=False, index=True)
    travel_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    departure_time = Column(String(10), nullable=False)           # HH:MM
    arrival_time = Column(String(10), nullable=False)             # HH:MM
    duration_minutes = Column(Integer, default=135)
    stops = Column(Integer, default=0)
    cabin_class = Column(String(30), default="Economy")
    fare_type = Column(String(30), default="Standard")
    base_fare = Column(Float, default=0.0)
    taxes = Column(Float, default=0.0)
    fees = Column(Float, default=0.0)
    total_fare = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    baggage_information = Column(String(100), default="15kg Check-in / 7kg Cabin")
    aircraft_type = Column(String(50), default="Airbus A320neo")
    seat_availability = Column(String(50), default="Available")
    booking_url = Column(Text, nullable=True)
    scraped_at = Column(DateTime, nullable=False, index=True)
    scraper_version = Column(String(20), default="1.0.0")

    __table_args__ = (
        Index("idx_route_date_airline", "origin", "destination", "travel_date", "airline"),
    )


class ScrapeRunModel(Base):
    __tablename__ = "scrape_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(50), unique=True, nullable=False, index=True)
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="PENDING")
    sources_attempted = Column(Integer, default=0)
    sources_successful = Column(Integer, default=0)
    sources_failed = Column(Integer, default=0)
    records_scraped = Column(Integer, default=0)
    records_valid = Column(Integer, default=0)
    records_inserted = Column(Integer, default=0)
    records_duplicate = Column(Integer, default=0)
    errors_json = Column(Text, nullable=True)


class ScrapeErrorModel(Base):
    __tablename__ = "scrape_errors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(50), nullable=False, index=True)
    source_name = Column(String(50), nullable=False)
    error_type = Column(String(50), nullable=False)
    error_message = Column(Text, nullable=False)
    occurred_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
