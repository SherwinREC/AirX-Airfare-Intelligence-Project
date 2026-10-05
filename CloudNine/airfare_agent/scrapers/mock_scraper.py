"""
Mock Flight Scraper (Ultra High-Volume 10X Real-Time Scale Engine)
Generates high-density, accurate flight choices across 10 Indian domestic airlines,
multiple schedule slots, fare types, and cabin classes for large-scale indexing.
"""

import asyncio
import random
from typing import List, Dict, Any
from models.airfare import SearchParams
from scrapers.base_scraper import BaseScraper


class MockScraper(BaseScraper):
    def __init__(self, headless: bool = True):
        super().__init__(name="mock_airline", source_type="airline", headless=headless)

    async def health_check(self) -> bool:
        return True

    async def search_flights(self, params: SearchParams) -> List[Dict[str, Any]]:
        await asyncio.sleep(0.001)  # Ultra fast async execution

        airlines_schedule = [
            # IndiGo
            {"airline": "IndiGo", "code": "6E-204", "dep": "05:15", "arr": "07:30", "dur": 135, "aircraft": "Airbus A320neo", "seats": "7 Seats Left"},
            {"airline": "IndiGo", "code": "6E-532", "dep": "08:45", "arr": "11:00", "dur": 135, "aircraft": "Airbus A321neo", "seats": "4 Seats Left"},
            {"airline": "IndiGo", "code": "6E-819", "dep": "11:30", "arr": "13:45", "dur": 135, "aircraft": "Airbus A320neo", "seats": "Available"},
            {"airline": "IndiGo", "code": "6E-104", "dep": "14:15", "arr": "16:30", "dur": 135, "aircraft": "Airbus A321neo", "seats": "2 Seats Left"},
            {"airline": "IndiGo", "code": "6E-902", "dep": "17:00", "arr": "19:15", "dur": 135, "aircraft": "Airbus A320neo", "seats": "Available"},
            {"airline": "IndiGo", "code": "6E-441", "dep": "19:45", "arr": "22:00", "dur": 135, "aircraft": "Airbus A321neo", "seats": "9 Seats Left"},
            {"airline": "IndiGo", "code": "6E-773", "dep": "22:30", "arr": "00:45", "dur": 135, "aircraft": "Airbus A320neo", "seats": "Available"},

            # Air India
            {"airline": "Air India", "code": "AI-540", "dep": "06:00", "arr": "08:20", "dur": 140, "aircraft": "Boeing 787-8", "seats": "Available"},
            {"airline": "Air India", "code": "AI-802", "dep": "09:30", "arr": "11:50", "dur": 140, "aircraft": "Airbus A350-900", "seats": "5 Seats Left"},
            {"airline": "Air India", "code": "AI-430", "dep": "13:00", "arr": "15:20", "dur": 140, "aircraft": "Boeing 787-8", "seats": "Available"},
            {"airline": "Air India", "code": "AI-670", "dep": "16:45", "arr": "19:05", "dur": 140, "aircraft": "Airbus A320neo", "seats": "3 Seats Left"},
            {"airline": "Air India", "code": "AI-991", "dep": "20:15", "arr": "22:35", "dur": 140, "aircraft": "Boeing 777-300ER", "seats": "Available"},

            # Vistara
            {"airline": "Vistara", "code": "UK-812", "dep": "06:30", "arr": "08:45", "dur": 135, "aircraft": "Airbus A320neo", "seats": "Available"},
            {"airline": "Vistara", "code": "UK-825", "dep": "10:15", "arr": "12:30", "dur": 135, "aircraft": "Boeing 787-9", "seats": "6 Seats Left"},
            {"airline": "Vistara", "code": "UK-992", "dep": "14:45", "arr": "17:00", "dur": 135, "aircraft": "Airbus A320neo", "seats": "Available"},
            {"airline": "Vistara", "code": "UK-708", "dep": "18:30", "arr": "20:45", "dur": 135, "aircraft": "Airbus A321neo", "seats": "1 Seat Left"},
            {"airline": "Vistara", "code": "UK-654", "dep": "21:15", "arr": "23:30", "dur": 135, "aircraft": "Boeing 787-9", "seats": "Available"},

            # Akasa Air
            {"airline": "Akasa Air", "code": "QP-1102", "dep": "07:00", "arr": "09:15", "dur": 135, "aircraft": "Boeing 737 MAX 8", "seats": "Available"},
            {"airline": "Akasa Air", "code": "QP-1450", "dep": "11:15", "arr": "13:30", "dur": 135, "aircraft": "Boeing 737 MAX 8", "seats": "8 Seats Left"},
            {"airline": "Akasa Air", "code": "QP-1890", "dep": "15:30", "arr": "17:45", "dur": 135, "aircraft": "Boeing 737 MAX 8", "seats": "Available"},
            {"airline": "Akasa Air", "code": "QP-2041", "dep": "19:15", "arr": "21:30", "dur": 135, "aircraft": "Boeing 737 MAX 8", "seats": "3 Seats Left"},

            # SpiceJet
            {"airline": "SpiceJet", "code": "SG-302", "dep": "08:10", "arr": "10:30", "dur": 140, "aircraft": "Boeing 737-800", "seats": "Available"},
            {"airline": "SpiceJet", "code": "SG-514", "dep": "13:40", "arr": "16:00", "dur": 140, "aircraft": "Boeing 737-800", "seats": "4 Seats Left"},
            {"airline": "SpiceJet", "code": "SG-881", "dep": "18:00", "arr": "20:20", "dur": 140, "aircraft": "Boeing 737-800", "seats": "Available"},

            # Air India Express
            {"airline": "Air India Express", "code": "IX-234", "dep": "09:00", "arr": "11:15", "dur": 135, "aircraft": "Boeing 737 MAX 8", "seats": "Available"},
            {"airline": "Air India Express", "code": "IX-567", "dep": "15:00", "arr": "17:15", "dur": 135, "aircraft": "Airbus A320neo", "seats": "Available"},
            {"airline": "Air India Express", "code": "IX-908", "dep": "21:00", "arr": "23:15", "dur": 135, "aircraft": "Boeing 737 MAX 8", "seats": "6 Seats Left"},

            # Alliance Air
            {"airline": "Alliance Air", "code": "9I-741", "dep": "10:45", "arr": "13:00", "dur": 135, "aircraft": "ATR 72-600", "seats": "Available"},
            {"airline": "Alliance Air", "code": "9I-882", "dep": "16:15", "arr": "18:30", "dur": 135, "aircraft": "ATR 72-600", "seats": "2 Seats Left"},

            # Star Air
            {"airline": "Star Air", "code": "S5-112", "dep": "12:30", "arr": "14:45", "dur": 135, "aircraft": "Embraer E175", "seats": "Available"},

            # Fly91
            {"airline": "Fly91", "code": "IC-401", "dep": "17:45", "arr": "20:00", "dur": 135, "aircraft": "ATR 72-600", "seats": "5 Seats Left"}
        ]

        raw_flights = []

        base_price_map = {
            "MAA-DEL": 4800, "DEL-MAA": 4850, "DEL-BOM": 4200, "BOM-DEL": 4250,
            "MAA-BOM": 3900, "BOM-MAA": 3950, "DEL-BLR": 5100, "BLR-DEL": 5150,
            "BLR-MAA": 2800, "MAA-BLR": 2850, "CCU-DEL": 5400, "DEL-CCU": 5450,
            "HYD-DEL": 4500, "DEL-HYD": 4550, "GOI-BOM": 3200, "BOM-GOI": 3250,
            "COK-DEL": 6100, "DEL-COK": 6150, "AMD-DEL": 3500, "DEL-AMD": 3550,
            "PNQ-DEL": 4600, "DEL-PNQ": 4650, "JAI-DEL": 2900, "DEL-JAI": 2950,
            "LKO-DEL": 3100, "DEL-LKO": 3150, "PAT-DEL": 4100, "DEL-PAT": 4150,
            "GAU-DEL": 5800, "DEL-GAU": 5850, "VNS-DEL": 3400, "DEL-VNS": 3450,
            "IXC-DEL": 2700, "DEL-IXC": 2750, "BBI-DEL": 4900, "DEL-BBI": 4950
        }

        route_key = f"{params.origin}-{params.destination}"
        base_route_price = base_price_map.get(route_key, 4500)

        # Generate observations across fare categories
        fare_types = ["Saver", "Flexi", "SuperSaver", "Corporate"]

        for item in airlines_schedule:
            seed = hash(f"{item['code']}_{params.travel_date}_{params.origin}_{params.destination}_{params.cabin_class}")
            random.seed(seed)

            for f_type in fare_types:
                price_variance = random.randint(-400, 800)
                tot_fare = float(base_route_price + price_variance)

                if f_type == "Flexi":
                    tot_fare += 600
                elif f_type == "Corporate":
                    tot_fare += 1200
                elif f_type == "SuperSaver":
                    tot_fare -= 300

                if params.cabin_class == "Business":
                    tot_fare = round(tot_fare * 2.8, 2)
                elif params.cabin_class == "Premium Economy":
                    tot_fare = round(tot_fare * 1.5, 2)
                elif params.cabin_class == "First":
                    tot_fare = round(tot_fare * 4.2, 2)

                b_fare = round(tot_fare * 0.82, 2)
                t_tax = round(tot_fare * 0.15, 2)
                f_fee = round(tot_fare * 0.03, 2)

                # Format clean date YYYY-MM-DD
                clean_date = str(params.travel_date).split("T")[0].split(" ")[0]

                raw_flights.append({
                    "airline": item["airline"],
                    "flight_number": item["code"],
                    "origin": params.origin,
                    "destination": params.destination,
                    "travel_date": clean_date,
                    "departure_time": item["dep"],
                    "arrival_time": item["arr"],
                    "duration_minutes": item["dur"],
                    "stops": 0,
                    "cabin_class": params.cabin_class,
                    "fare_type": f_type,
                    "base_fare": b_fare,
                    "taxes": t_tax,
                    "fees": f_fee,
                    "total_fare": tot_fare,
                    "currency": "INR",
                    "baggage_information": "15kg Check-in / 7kg Cabin",
                    "aircraft_type": item["aircraft"],
                    "seat_availability": item["seats"],
                    "booking_url": f"https://booking.airfare-index.in/flight/{item['code']}?org={params.origin}&dest={params.destination}&date={clean_date}"
                })

        return raw_flights
