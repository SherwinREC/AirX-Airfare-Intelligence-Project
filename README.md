# ✈️ AIRX – Airfare Intelligence Platform

> **Real-time airfare intelligence for tracking price movements and supporting inflation analysis.**

AIRX is an automated airfare intelligence platform designed to collect, clean, standardize, and analyze online airfare data across representative Indian routes.

The system transforms raw airfare observations into structured datasets and generates **Airfare Price Indices (APIx)** to provide insights into airfare trends, route-wise price movements, booking lead times, and fare components.

---

## 🎯 Problem Statement

Airfare data is often collected manually or at low frequency, making it difficult to obtain a reliable and high-frequency view of airfare price movements.

Existing data also contains:

- Limited visibility across routes and booking windows
- Raw fares with inconsistencies and outliers
- Mixed fare components
- Limited transparency in data quality
- Monthly rather than high-frequency price information
- Lack of an API for system-level integration

AIRX addresses these challenges through an automated data collection and processing pipeline.

---

## 💡 Solution

AIRX provides an automated workflow that:

1. Collects airfare observations from airline and OTA sources.
2. Standardizes and validates the collected data.
3. Removes duplicates, outliers, and inconsistent observations.
4. Separates fare components such as base fare, taxes, UDF, and fees.
5. Organizes fares according to routes and booking lead-time windows.
6. Applies traffic-based weights and statistical methods.
7. Generates daily, weekly, and monthly Airfare Price Indices.
8. Provides dashboards and APIs for further analysis and integration.

---

## ⚙️ How It Works

```text
Airline & OTA Sources
        ↓
Data Collection
        ↓
Data Cleaning & Standardization
        ↓
Validation & Outlier Filtering
        ↓
Fare Component Separation
        ↓
Weighted Index Engine
        ↓
Airfare Price Index
        ↓
Dashboard & REST API
