"""
Airfare Data Normalizer
Standardizes messy scraped raw data strings into consistent canonical representations.
"""

import re
from datetime import datetime
from typing import Optional


class AirfareNormalizer:
    # Comprehensive Indian Airport & International Airport IATA Map
    AIRPORT_IATA_MAP = {
        "MAA": "MAA", "CHENNAI": "MAA", "MADRAS": "MAA",
        "DEL": "DEL", "DELHI": "DEL", "NEW DELHI": "DEL", "INDIRA GANDHI": "DEL",
        "BOM": "BOM", "MUMBAI": "BOM", "BOMBAY": "BOM", "CHHATRAPATI SHIVAJI": "BOM",
        "BLR": "BLR", "BENGALURU": "BLR", "BANGALORE": "BLR", "KEMPEGOWDA": "BLR",
        "CCU": "CCU", "KOLKATA": "CCU", "CALCUTTA": "CCU", "NETAJI SUBHASH CHANDRA BOSE": "CCU",
        "HYD": "HYD", "HYDERABAD": "HYD", "RAJIV GANDHI": "HYD",
        "GOI": "GOI", "GOX": "GOX", "GOA": "GOI", "DABOLIM": "GOI", "MOPA": "GOX",
        "AMD": "AMD", "AHMEDABAD": "AMD", "SARDAR VALLABHBHAI PATEL": "AMD",
        "PNQ": "PNQ", "PUNE": "PNQ",
        "COK": "COK", "KOCHI": "COK", "COCHIN": "COK",
        "TRV": "TRV", "THIRUVANANTHAPURAM": "TRV", "TRIVANDRUM": "TRV",
        "IXC": "IXC", "CHANDIGARH": "IXC",
        "JAI": "JAI", "JAIPUR": "JAI",
        "LKO": "LKO", "LUCKNOW": "LKO",
        "PAT": "PAT", "PATNA": "PAT",
        "GAU": "GAU", "GUWAHATI": "GAU",
        "VNS": "VNS", "VARANASI": "VNS", "BENARES": "VNS"
    }

    AIRLINE_MAP = {
        "INDIGO": "IndiGo",
        "6E": "IndiGo",
        "AIR INDIA": "Air India",
        "AI": "Air India",
        "VISTARA": "Vistara",
        "UK": "Vistara",
        "SPICEJET": "SpiceJet",
        "SG": "SpiceJet",
        "AKASA": "Akasa Air",
        "AKASA AIR": "Akasa Air",
        "QP": "Akasa Air",
        "AIR INDIA EXPRESS": "Air India Express",
        "IX": "Air India Express",
        "ALLIANCE AIR": "Alliance Air",
        "9I": "Alliance Air"
    }

    @classmethod
    def normalize_iata(cls, raw_airport: str) -> str:
        """Convert airport name or string to 3-letter IATA code."""
        if not raw_airport:
            return ""

        clean = str(raw_airport).upper().strip()

        # Check direct 3-letter match
        match = re.search(r'\b([A-Z]{3})\b', clean)
        if match and match.group(1) in cls.AIRPORT_IATA_MAP.values():
            return match.group(1)

        # Check lookup map
        for key, iata in cls.AIRPORT_IATA_MAP.items():
            if key in clean:
                return iata

        return clean[:3] if len(clean) >= 3 else clean

    @classmethod
    def normalize_fare(cls, raw_price: any) -> float:
        """
        Cleans strings like '₹5,420', 'Rs. 5,420.00', 'INR 5420' into numeric float 5420.0.
        """
        if raw_price is None:
            return 0.0

        if isinstance(raw_price, (int, float)):
            return round(float(raw_price), 2)

        price_str = str(raw_price)

        # Match numbers with commas and optional decimal e.g. 5,420.50 or 5420
        match = re.search(r'([\d,]+(?:\.\d{1,2})?)', price_str)
        if match:
            clean_num = match.group(1).replace(",", "")
            try:
                val = float(clean_num)
                return round(val, 2)
            except ValueError:
                return 0.0

        return 0.0

    @classmethod
    def normalize_time(cls, raw_time: str) -> str:
        """Converts time string to 24-hour HH:MM format."""
        if not raw_time:
            return "00:00"

        clean = str(raw_time).strip().upper()

        # 12-hour format with AM/PM e.g. "10:30 AM", "08:15 PM"
        ampm_match = re.search(r'(\d{1,2}):(\d{2})\s*(AM|PM)', clean)
        if ampm_match:
            hr = int(ampm_match.group(1))
            mn = int(ampm_match.group(2))
            period = ampm_match.group(3)

            if period == "PM" and hr < 12:
                hr += 12
            elif period == "AM" and hr == 12:
                hr = 0

            return f"{hr:02d}:{mn:02d}"

        # 24-hour HH:MM format e.g. "10:30", "22:15"
        time_match = re.search(r'(\d{1,2}):(\d{2})', clean)
        if time_match:
            hr = int(time_match.group(1))
            mn = int(time_match.group(2))
            return f"{hr:02d}:{mn:02d}"

        return "00:00"

    @classmethod
    def normalize_stops(cls, raw_stops: any) -> int:
        """Converts layover strings ('Non-stop', '1 Stop', '2 Layovers') to integer count."""
        if raw_stops is None:
            return 0

        if isinstance(raw_stops, int):
            return max(0, raw_stops)

        stops_str = str(raw_stops).lower()
        if "non" in stops_str or "direct" in stops_str:
            return 0

        digits = re.findall(r'\d+', stops_str)
        if digits:
            return int(digits[0])

        return 0

    @classmethod
    def normalize_airline(cls, raw_airline: str) -> str:
        """Normalizes airline brand name."""
        if not raw_airline:
            return "Unknown Airline"

        clean = str(raw_airline).strip().upper()

        for key, canonical in cls.AIRLINE_MAP.items():
            if key in clean:
                return canonical

        return str(raw_airline).strip().title()

    @classmethod
    def normalize_date(cls, raw_date: str) -> str:
        """Standardizes travel date into YYYY-MM-DD format."""
        if not raw_date:
            return datetime.now().strftime("%Y-%m-%d")

        clean = str(raw_date).strip()

        # Check ISO format YYYY-MM-DD
        if re.match(r'^\d{4}-\d{2}-\d{2}$', clean):
            return clean

        formats_to_try = [
            "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d",
            "%d %b %Y", "%d %B %Y", "%b %d, %Y"
        ]

        for fmt in formats_to_try:
            try:
                dt = datetime.strptime(clean, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue

        return clean
