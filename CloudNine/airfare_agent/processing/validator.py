"""
Airfare Data Quality Validator
Ensures scraped observation records satisfy data integrity rules before persistence.
"""

from typing import List, Tuple, Dict, Any
import re
from datetime import datetime
from models.airfare import AirfareObservation


class AirfareValidator:
    @classmethod
    def validate_dict(cls, data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate a dictionary of raw observation fields."""
        errors = []

        # Validate origin & destination
        origin = str(data.get("origin", "")).strip().upper()
        destination = str(data.get("destination", "")).strip().upper()

        if len(origin) != 3 or not origin.isalpha():
            errors.append(f"Invalid origin IATA code: '{origin}'")

        if len(destination) != 3 or not destination.isalpha():
            errors.append(f"Invalid destination IATA code: '{destination}'")

        if origin and destination and origin == destination:
            errors.append(f"Origin and destination cannot be identical ('{origin}')")

        # Validate total fare
        try:
            total_fare = float(data.get("total_fare", 0))
            if total_fare <= 0:
                errors.append(f"Total fare must be > 0, got {total_fare}")
        except (ValueError, TypeError):
            errors.append(f"Invalid numeric total_fare: '{data.get('total_fare')}'")

        # Validate airline & flight number
        airline = str(data.get("airline", "")).strip()
        if not airline:
            errors.append("Airline name cannot be empty")

        # Validate travel date format
        travel_date = str(data.get("travel_date", "")).strip()
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', travel_date):
            errors.append(f"Travel date must be in YYYY-MM-DD format, got '{travel_date}'")

        is_valid = len(errors) == 0
        return is_valid, errors

    @classmethod
    def validate_observation(cls, obs: AirfareObservation) -> Tuple[bool, List[str]]:
        """Validate a Pydantic AirfareObservation instance."""
        return cls.validate_dict(obs.model_dump())
