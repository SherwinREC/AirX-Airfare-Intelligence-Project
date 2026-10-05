"""
Abstract Base Scraper Interface
Every website/airline scraper must inherit from this class and implement its standard interface methods.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any
from models.airfare import SearchParams, AirfareObservation
from processing.normalizer import AirfareNormalizer
from processing.deduplicator import AirfareDeduplicator


class BaseScraper(ABC):
    def __init__(self, name: str, source_type: str = "ota", headless: bool = True):
        self.name = name
        self.source_type = source_type
        self.headless = headless
        self.version = "1.0.0"

    @abstractmethod
    async def health_check(self) -> bool:
        """Verify network reachability and health of source."""
        pass

    @abstractmethod
    async def search_flights(self, params: SearchParams) -> List[Dict[str, Any]]:
        """
        Execute real-time flight search on source website using Playwright/HTTP.
        Returns a list of raw flight data dictionaries.
        """
        pass

    def normalize(self, raw_records: List[Dict[str, Any]], params: SearchParams) -> List[AirfareObservation]:
        """
        Convert raw scraped dictionaries into standardized AirfareObservation objects.
        Shared default implementation using AirfareNormalizer & AirfareDeduplicator.
        """
        observations = []
        for raw in raw_records:
            origin = AirfareNormalizer.normalize_iata(raw.get("origin") or params.origin)
            destination = AirfareNormalizer.normalize_iata(raw.get("destination") or params.destination)
            airline = AirfareNormalizer.normalize_airline(raw.get("airline", "IndiGo"))
            flight_number = str(raw.get("flight_number", "FL-100")).strip().upper()
            travel_date = AirfareNormalizer.normalize_date(raw.get("travel_date") or params.travel_date)
            departure_time = AirfareNormalizer.normalize_time(raw.get("departure_time", "08:00"))
            arrival_time = AirfareNormalizer.normalize_time(raw.get("arrival_time", "10:30"))
            duration_minutes = int(raw.get("duration_minutes", 120))
            stops = AirfareNormalizer.normalize_stops(raw.get("stops", 0))
            cabin_class = str(raw.get("cabin_class") or params.cabin_class).strip().title()
            fare_type = str(raw.get("fare_type", "Standard")).strip()
            total_fare = AirfareNormalizer.normalize_fare(raw.get("total_fare", 5000))
            base_fare = AirfareNormalizer.normalize_fare(raw.get("base_fare")) if raw.get("base_fare") else None
            taxes = AirfareNormalizer.normalize_fare(raw.get("taxes")) if raw.get("taxes") else None
            currency = str(raw.get("currency") or params.currency).strip().upper()
            baggage = str(raw.get("baggage_information", "15kg Check-in / 7kg Cabin"))
            booking_url = str(raw.get("booking_url", ""))

            aircraft_type = str(raw.get("aircraft_type", "Airbus A320neo")).strip()
            seat_availability = str(raw.get("seat_availability", "Available")).strip()

            scraped_at_now = str(raw.get("scraped_at") or params.__dict__.get("scraped_at") or "")

            # Compute SHA-256 fingerprint hash
            obs_id = AirfareDeduplicator.generate_fingerprint(
                source_name=self.name,
                airline=airline,
                flight_number=flight_number,
                origin=origin,
                destination=destination,
                travel_date=travel_date,
                departure_time=departure_time,
                cabin_class=cabin_class,
                total_fare=total_fare,
                scraped_at=scraped_at_now
            )

            try:
                obs = AirfareObservation(
                    observation_id=obs_id,
                    source_name=self.name,
                    source_type=self.source_type,
                    airline=airline,
                    flight_number=flight_number,
                    origin=origin,
                    destination=destination,
                    travel_date=travel_date,
                    departure_time=departure_time,
                    arrival_time=arrival_time,
                    duration_minutes=duration_minutes,
                    stops=stops,
                    cabin_class=cabin_class,
                    fare_type=fare_type,
                    base_fare=base_fare,
                    taxes=taxes,
                    total_fare=total_fare,
                    currency=currency,
                    baggage_information=baggage,
                    aircraft_type=aircraft_type,
                    seat_availability=seat_availability,
                    booking_url=booking_url,
                    scraper_version=self.version
                )
                observations.append(obs)
            except Exception as e:
                # Validation error handles bad observations
                continue

        return observations
