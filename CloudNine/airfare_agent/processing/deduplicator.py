"""
Airfare Composite Fingerprint & Deduplication Engine
"""

import hashlib
from typing import Dict, Any, List
from models.airfare import AirfareObservation


class AirfareDeduplicator:
    @classmethod
    def generate_fingerprint(
        cls,
        source_name: str,
        airline: str,
        flight_number: str,
        origin: str,
        destination: str,
        travel_date: str,
        departure_time: str,
        cabin_class: str,
        total_fare: float,
        scraped_at: str = ""
    ) -> str:
        """
        Generates a SHA-256 fingerprint hash unique to this exact fare observation.
        Includes total_fare and scraped_date so that price changes and daily scans create distinct real-time tracking points!
        """
        s_name = str(source_name).strip().lower()
        al = str(airline).strip().lower()
        fn = str(flight_number).strip().upper().replace(" ", "")
        org = str(origin).strip().upper()
        dest = str(destination).strip().upper()
        t_date = str(travel_date).strip()
        dep_time = str(departure_time).strip()
        cabin = str(cabin_class).strip().lower()
        fare = f"{float(total_fare):.2f}"
        s_date = str(scraped_at).split("T")[0].split(" ")[0] if scraped_at else ""

        raw_key = f"{s_name}|{al}|{fn}|{org}|{dest}|{t_date}|{dep_time}|{cabin}|{fare}|{s_date}"
        return hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

    @classmethod
    def deduplicate_batch(cls, observations: List[AirfareObservation]) -> List[AirfareObservation]:
        """In-memory deduplication of a batch before inserting to database."""
        seen_hashes = set()
        unique_list = []

        for obs in observations:
            if obs.observation_id not in seen_hashes:
                seen_hashes.add(obs.observation_id)
                unique_list.append(obs)

        return unique_list
