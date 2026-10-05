"""
Unit tests for AirfareNormalizer
"""

from processing.normalizer import AirfareNormalizer


def test_normalize_iata():
    assert AirfareNormalizer.normalize_iata("Chennai") == "MAA"
    assert AirfareNormalizer.normalize_iata("Chennai (MAA)") == "MAA"
    assert AirfareNormalizer.normalize_iata("DELHI") == "DEL"
    assert AirfareNormalizer.normalize_iata("BOM") == "BOM"
    assert AirfareNormalizer.normalize_iata("Bangalore") == "BLR"


def test_normalize_fare():
    assert AirfareNormalizer.normalize_fare("₹5,420") == 5420.0
    assert AirfareNormalizer.normalize_fare("Rs. 5,420.50") == 5420.5
    assert AirfareNormalizer.normalize_fare("INR 6040") == 6040.0
    assert AirfareNormalizer.normalize_fare(4850) == 4850.0


def test_normalize_time():
    assert AirfareNormalizer.normalize_time("10:30 AM") == "10:30"
    assert AirfareNormalizer.normalize_time("08:15 PM") == "20:15"
    assert AirfareNormalizer.normalize_time("14:45") == "14:45"
    assert AirfareNormalizer.normalize_time("12:00 AM") == "00:00"


def test_normalize_stops():
    assert AirfareNormalizer.normalize_stops("Non-stop") == 0
    assert AirfareNormalizer.normalize_stops("Direct") == 0
    assert AirfareNormalizer.normalize_stops("1 Stop") == 1
    assert AirfareNormalizer.normalize_stops(2) == 2


def test_normalize_airline():
    assert AirfareNormalizer.normalize_airline("6E") == "IndiGo"
    assert AirfareNormalizer.normalize_airline("IndiGo Airlines") == "IndiGo"
    assert AirfareNormalizer.normalize_airline("AIR INDIA") == "Air India"
    assert AirfareNormalizer.normalize_airline("Vistara") == "Vistara"
