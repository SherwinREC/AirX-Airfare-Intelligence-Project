"""
Unit tests for AirfareValidator
"""

from processing.validator import AirfareValidator


def test_validator_success():
    valid_record = {
        "origin": "MAA",
        "destination": "DEL",
        "total_fare": 5420.0,
        "airline": "IndiGo",
        "flight_number": "6E-204",
        "travel_date": "2026-09-01"
    }
    is_valid, errors = AirfareValidator.validate_dict(valid_record)
    assert is_valid is True
    assert len(errors) == 0


def test_validator_invalid_fare():
    invalid_record = {
        "origin": "MAA",
        "destination": "DEL",
        "total_fare": 0.0,  # Invalid zero fare!
        "airline": "IndiGo",
        "travel_date": "2026-09-01"
    }
    is_valid, errors = AirfareValidator.validate_dict(invalid_record)
    assert is_valid is False
    assert any("Total fare must be > 0" in e for e in errors)


def test_validator_same_origin_dest():
    invalid_record = {
        "origin": "MAA",
        "destination": "MAA",  # Invalid identical origin & dest
        "total_fare": 5000.0,
        "airline": "IndiGo",
        "travel_date": "2026-09-01"
    }
    is_valid, errors = AirfareValidator.validate_dict(invalid_record)
    assert is_valid is False
    assert any("Origin and destination cannot be identical" in e for e in errors)
