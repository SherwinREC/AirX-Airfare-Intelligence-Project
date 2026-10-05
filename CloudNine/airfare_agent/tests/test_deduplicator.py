"""
Unit tests for AirfareDeduplicator
"""

from processing.deduplicator import AirfareDeduplicator


def test_fingerprint_consistency():
    hash1 = AirfareDeduplicator.generate_fingerprint(
        source_name="easemytrip",
        airline="IndiGo",
        flight_number="6E-204",
        origin="MAA",
        destination="DEL",
        travel_date="2026-09-01",
        departure_time="06:00",
        cabin_class="Economy",
        total_fare=5000.0
    )

    hash2 = AirfareDeduplicator.generate_fingerprint(
        source_name="easemytrip",
        airline="IndiGo",
        flight_number="6E-204",
        origin="MAA",
        destination="DEL",
        travel_date="2026-09-01",
        departure_time="06:00",
        cabin_class="Economy",
        total_fare=5000.0
    )

    assert hash1 == hash2


def test_fingerprint_changes_on_fare_update():
    hash_old = AirfareDeduplicator.generate_fingerprint(
        source_name="easemytrip",
        airline="IndiGo",
        flight_number="6E-204",
        origin="MAA",
        destination="DEL",
        travel_date="2026-09-01",
        departure_time="06:00",
        cabin_class="Economy",
        total_fare=5000.0
    )

    hash_new = AirfareDeduplicator.generate_fingerprint(
        source_name="easemytrip",
        airline="IndiGo",
        flight_number="6E-204",
        origin="MAA",
        destination="DEL",
        travel_date="2026-09-01",
        departure_time="06:00",
        cabin_class="Economy",
        total_fare=5400.0  # Changed fare!
    )

    # Different fare MUST yield different hash to preserve historical price observation!
    assert hash_old != hash_new
